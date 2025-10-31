"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2Icon } from "lucide-react"

interface DeleteEventButtonProps {
  eventId: string
}

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Delete all RSVPs first
      await supabase.from("rsvps").delete().eq("event_id", eventId)
      
      // Delete the event
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)

      if (deleteError) throw deleteError

      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2Icon className="h-4 w-4" />
          Delete Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this event? This action cannot be undone and will remove all RSVPs.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="p-3 rounded-lg bg-muted border border-border">
            <p className="text-sm text-foreground">{error}</p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}