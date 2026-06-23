import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"
import { Toaster } from "sonner"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

export const metadata: Metadata = {
  title: "Music Analyzer — AI Success Score & Marketing Plan",
  description:
    "Upload your track and get an AI-generated commercial success score plus a complete marketing plan covering TikTok, Instagram, YouTube, Spotify, and more.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
