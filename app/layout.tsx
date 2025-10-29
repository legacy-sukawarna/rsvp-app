import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Legacy Events",
  description: "Create and join events",
  generator: "v0.app",
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEGACY%20LOGO%202025%20-%207-qmcsAvoAEUYPnzuiQb6Hmp5DGlYnmz.png",
    apple:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEGACY%20LOGO%202025%20-%207-qmcsAvoAEUYPnzuiQb6Hmp5DGlYnmz.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
