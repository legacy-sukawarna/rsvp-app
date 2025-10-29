"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, UsersIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

interface Event {
  id: string
  title: string
  description: string
  location: string
  event_date: string
  capacity: number
  image_url: string | null
  created_at: string
}

interface RSVP {
  id: string
  event_id: string
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })

      if (eventsError) {
        setError(eventsError.message)
        setLoading(false)
        return
      }

      const { data: rsvpsData } = await supabase.from("rsvps").select("id, event_id")

      const counts = (rsvpsData || []).reduce(
        (acc, rsvp) => {
          acc[rsvp.event_id] = (acc[rsvp.event_id] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      setEvents(eventsData || [])
      setRsvpCounts(counts)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading events: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEGACY%20LOGO%202025%20-%208-y7muvZxVozedM2myTuZgQ8d7m3W17E.png"
              alt="Legacy Logo"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
            <div className="border-l border-border pl-4">
              <h1 className="text-2xl font-bold text-balance">Event RSVP</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Discover and join events</p>
            </div>
          </div>
          <Link href="/create">
            <Button size="lg" className="gap-2">
              <PlusIcon className="h-5 w-5" />
              Create Event
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {events.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No events yet</h2>
              <p className="text-muted-foreground mb-6">Be the first to create an event!</p>
              <Link href="/create">
                <Button>Create Your First Event</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => {
              const attendeeCount = rsvpCounts[event.id] || 0
              const spotsLeft = event.capacity - attendeeCount
              const isFull = spotsLeft <= 0

              return (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border-2">
                    <div className="relative h-48 bg-muted">
                      {event.image_url ? (
                        <img
                          src={event.image_url || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CalendarIcon className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                      {isFull && <Badge className="absolute top-3 right-3 bg-foreground text-background">Full</Badge>}
                    </div>

                    <CardHeader>
                      <CardTitle className="text-xl text-balance">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{new Date(event.event_date).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.open(event.location, "_blank", "noopener,noreferrer")
                          }}
                          className="truncate hover:underline text-left"
                        >
                          View on Maps
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">
                          {attendeeCount} / {event.capacity} attending
                        </span>
                      </div>

                      {!isFull && spotsLeft <= 10 && (
                        <Badge variant="outline" className="border-foreground">
                          Only {spotsLeft} spots left!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
