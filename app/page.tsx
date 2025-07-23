"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

// Simple loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Loading Avatar Assistant...</h1>
        <p className="text-slate-300">Initializing AI components</p>
      </div>
    </div>
  )
}

export default function AvatarBot() {
  const [isClient, setIsClient] = useState(false)
  const [AvatarBotMain, setAvatarBotMain] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    // Set client flag
    setIsClient(true)

    // Dynamically import the main component only on client
    import("@/components/avatar-bot-main")
      .then((module) => {
        setAvatarBotMain(() => module.default)
      })
      .catch((error) => {
        console.error("Failed to load main component:", error)
      })
  }, [])

  // Show loading until client-side and component is loaded
  if (!isClient || !AvatarBotMain) {
    return <LoadingScreen />
  }

  return <AvatarBotMain />
}
