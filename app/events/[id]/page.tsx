import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, MapPinIcon, UsersIcon, ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { RSVPForm } from "@/components/rsvp-form"
import { ImagePopup } from "@/components/image-popup"
import { DeleteEventButton } from "@/components/delete-event-button"
import { ShareButton } from "@/components/share-button"
import { EditIcon } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch event details
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", id).single()

  if (eventError || !event) {
    notFound()
  }

  // Fetch RSVPs for this event
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true })

  const attendeeCount = rsvps?.length || 0
  const spotsLeft = event.capacity - attendeeCount
  const isFull = spotsLeft <= 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <div className="flex gap-2">
            <ShareButton eventId={id} />
            {user && event.created_by === user.id && (
              <>
                <Link href={`/events/${id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <EditIcon className="h-4 w-4" />
                    Edit Event
                  </Button>
                </Link>
                <DeleteEventButton eventId={id} />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl overflow-hidden border-2">
              {/* Event Image */}
              <div className="relative h-80 bg-muted">
                {event.image_url ? (
                  <ImagePopup src={event.image_url} alt={event.title}>
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </ImagePopup>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarIcon className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
                {isFull && (
                  <Badge className="absolute top-4 right-4 bg-foreground text-background text-base px-4 py-2">
                    Event Full
                  </Badge>
                )}
              </div>

              <CardHeader className="space-y-4">
                <CardTitle className="text-4xl font-bold text-balance">{event.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{event.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-base">
                  <CalendarIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{new Date(event.event_date).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-3 text-base">
                  <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                  <a
                    href={event.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline flex items-center gap-2"
                  >
                    View Location on Google Maps
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </div>

                <div className="flex items-center gap-3 text-base">
                  <UsersIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">
                    {attendeeCount} / {event.capacity} attending
                  </span>
                </div>

                {!isFull && spotsLeft <= 10 && (
                  <Badge variant="outline" className="border-foreground text-sm px-3 py-1">
                    Only {spotsLeft} spots left!
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RSVP Section */}
          <div className="space-y-6">
            {/* RSVP Form */}
            <RSVPForm eventId={id} isFull={isFull} />

            {/* Attendees List */}
            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle className="text-xl">Attendees ({attendeeCount})</CardTitle>
                <CardDescription>See who's coming to this event</CardDescription>
              </CardHeader>
              <CardContent>
                {!rsvps || rsvps.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No one has RSVP'd yet. Be the first!</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {rsvps.map((rsvp) => (
                      <div key={rsvp.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <Avatar>
                          {rsvp.avatar_url && <AvatarImage src={rsvp.avatar_url} />}
                          <AvatarFallback className="bg-foreground text-background">
                            {rsvp.attendee_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{rsvp.attendee_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
