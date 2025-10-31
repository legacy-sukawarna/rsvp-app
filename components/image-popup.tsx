"use client"

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

interface ImagePopupProps {
  src: string
  alt: string
  children: React.ReactNode
}

export function ImagePopup({ src, alt, children }: ImagePopupProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 overflow-auto">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img
          src={src}
          alt={alt}
          className="w-full h-auto"
        />
      </DialogContent>
    </Dialog>
  )
}