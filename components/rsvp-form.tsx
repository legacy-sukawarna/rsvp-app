"use client"

import type React from "react"

import { useState } from "react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { signInWithGoogle } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircleIcon } from "lucide-react"

interface RSVPFormProps {
  eventId: string
  isFull: boolean
}

export function RSVPForm({ eventId, isFull }: RSVPFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [userRSVP, setUserRSVP] = useState<any>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleRSVP = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    setShowConfirmDialog(false)

    try {
      const supabase = createClient()

      if (userRSVP) {
        setError("You've already RSVP'd to this event!")
        setIsLoading(false)
        return
      }

      const { data: newRSVP, error: insertError } = await supabase.from("rsvps").insert({
        event_id: eventId,
        user_id: user.id,
        attendee_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        avatar_url: user.user_metadata?.avatar_url
      }).select().single()

      if (insertError) throw insertError

      setSuccess(true)
      setUserRSVP(newRSVP) // Store the actual RSVP record
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to RSVP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      setError('Failed to sign in')
    }
  }

  const handleCancel = async () => {
    if (!user || !userRSVP) return
    
    setIsLoading(true)
    setError(null)
    setShowCancelDialog(false)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from("rsvps")
        .delete()
        .eq("id", userRSVP.id)

      if (deleteError) throw deleteError

      setUserRSVP(null)
      setSuccess(false)
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel RSVP")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has already RSVP'd
  React.useEffect(() => {
    if (!user) return
    
    const checkRSVP = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single()
      
      setUserRSVP(data)
    }
    
    checkRSVP()
  }, [user, eventId])

  if (success) {
    return (
      <Card className="shadow-xl border-2 bg-card">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-foreground mb-3" />
          <h3 className="text-xl font-bold mb-2">You're in!</h3>
          <p className="text-muted-foreground text-center mb-4">Your RSVP has been confirmed</p>
          
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                Cancel RSVP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel RSVP</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your registration for this event?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  Keep RSVP
                </Button>
                <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
                  {isLoading ? "Cancelling..." : "Cancel RSVP"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
        ) : !user ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground mb-4">Sign in to RSVP to this event</p>
            <Button onClick={handleSignIn} className="w-full">
              Sign in with Google
            </Button>
          </div>
        ) : userRSVP ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">You're registered for this event</p>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-sm text-foreground">{error}</p>
              </div>
            )}

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={isLoading}>
                  Cancel RSVP
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel RSVP</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel your registration for this event?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Keep RSVP
                  </Button>
                  <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
                    {isLoading ? "Cancelling..." : "Cancel RSVP"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-sm text-foreground">{error}</p>
              </div>
            )}

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={isLoading}>
                  Register for Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm RSVP</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to register for this event?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRSVP} disabled={isLoading}>
                    {isLoading ? "Registering..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
