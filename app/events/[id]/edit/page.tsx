"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { uploadImage } from "@/app/create/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, MapPinIcon, UsersIcon, ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditEventPage({ params }: PageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [eventId, setEventId] = useState<string>("")
  const [event, setEvent] = useState<any>(null)
  const [rsvpCount, setRsvpCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setEventId(p.id))
  }, [params])

  useEffect(() => {
    if (!eventId || authLoading) return

    const fetchEvent = async () => {
      const supabase = createClient()
      
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single()

      if (eventError || !eventData) {
        router.push("/")
        return
      }

      if (!user || eventData.created_by !== user.id) {
        router.push(`/events/${eventId}`)
        return
      }

      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("id")
        .eq("event_id", eventId)

      setEvent(eventData)
      setRsvpCount(rsvps?.length || 0)
      setImagePreview(eventData.image_url)
      setIsLoading(false)
    }

    fetchEvent()
  }, [eventId, user, authLoading, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const eventDate = formData.get("event_date") as string
    const capacity = Number.parseInt(formData.get("capacity") as string)

    if (capacity < rsvpCount) {
      setError(`Capacity cannot be less than current RSVPs (${rsvpCount})`)
      setIsSaving(false)
      return
    }

    try {
      let imageUrl = event.image_url

      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append("image", imageFile)
        const result = await uploadImage(imageFormData)

        if (result.error) {
          throw new Error(result.error)
        }

        imageUrl = result.url
      }

      const supabase = createClient()
      const { error: updateError } = await supabase
        .from("events")
        .update({
          title,
          description,
          location,
          event_date: eventDate,
          capacity,
          image_url: imageUrl,
        })
        .eq("id", eventId)

      if (updateError) throw updateError

      router.push(`/events/${eventId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 mb-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEGACY%20LOGO%202025%20-%207-qmcsAvoAEUYPnzuiQb6Hmp5DGlYnmz.png"
            alt="Legacy Logo"
            width={120}
            height={34}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-2">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-balance">Edit Event</CardTitle>
            <CardDescription className="text-base">Update your event details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Event Image
                </Label>
                <div className="flex flex-col gap-4">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" name="title" defaultValue={event.title} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={event.description}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Location (Google Maps Link)
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="url"
                  defaultValue={event.location}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date & Time
                </Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="datetime-local"
                  defaultValue={new Date(event.event_date).toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min={rsvpCount}
                  defaultValue={event.capacity}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Current RSVPs: {rsvpCount}. Capacity must be at least {rsvpCount}.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-sm text-foreground">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/events/${eventId}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}