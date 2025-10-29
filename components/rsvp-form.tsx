"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon } from "lucide-react"

interface RSVPFormProps {
  eventId: string
  isFull: boolean
}

export function RSVPForm({ eventId, isFull }: RSVPFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    try {
      const supabase = createClient()

      const { data: existing } = await supabase
        .from("rsvps")
        .select("id")
        .eq("event_id", eventId)
        .eq("attendee_name", name)
        .single()

      if (existing) {
        setError("You've already RSVP'd to this event!")
        setIsLoading(false)
        return
      }

      const { error: insertError } = await supabase.from("rsvps").insert({
        event_id: eventId,
        attendee_name: name,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to RSVP")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="shadow-xl border-2 bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircleIcon className="h-16 w-16 text-foreground mb-4" />
          <h3 className="text-2xl font-bold mb-2">You're in!</h3>
          <p className="text-muted-foreground text-center">Your RSVP has been confirmed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-2">
      <CardHeader>
        <CardTitle className="text-xl">RSVP to this event</CardTitle>
        <CardDescription>Join others attending this event</CardDescription>
      </CardHeader>
      <CardContent>
        {isFull ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">This event is at full capacity</p>
            <p className="text-sm text-muted-foreground">Check back later for cancellations</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-sm text-foreground">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "RSVP Now"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
