"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2Icon, CheckIcon } from "lucide-react"

interface ShareButtonProps {
  eventId: string
}

export function ShareButton({ eventId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${eventId}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2Icon className="h-4 w-4" />
          Share
        </>
      )}
    </Button>
  )
}