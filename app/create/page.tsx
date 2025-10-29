"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uploadImage } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, MapPinIcon, UsersIcon, ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const eventDate = formData.get("event_date") as string
    const capacity = Number.parseInt(formData.get("capacity") as string)

    try {
      let imageUrl = null

      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append("image", imageFile)
        const result = await uploadImage(imageFormData)

        if (result.error) {
          throw new Error(result.error)
        }

        imageUrl = result.url
      }

      // Create event in Supabase
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          title,
          description,
          location,
          event_date: eventDate,
          capacity,
          image_url: imageUrl,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEGACY%20LOGO%202025%20-%208-y7muvZxVozedM2myTuZgQ8d7m3W17E.png"
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
            <CardTitle className="text-3xl font-bold text-balance">Create New Event</CardTitle>
            <CardDescription className="text-base">Fill in the details to create your event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Event Image
                </Label>
                <div className="flex flex-col gap-4">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                      <img
                        src={imagePreview || "/placeholder.svg"}
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

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" name="title" placeholder="Summer Music Festival" required />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell people what your event is about..."
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
                  placeholder="https://maps.google.com/?q=Central+Park+New+York"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Paste a Google Maps link (e.g., https://maps.google.com/?q=...)
                </p>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="event_date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date & Time
                </Label>
                <Input id="event_date" name="event_date" type="datetime-local" required />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Capacity
                </Label>
                <Input id="capacity" name="capacity" type="number" min="1" placeholder="100" required />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-sm text-foreground">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
