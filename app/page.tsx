"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

// Simple fallback component
function SimpleFallback() {
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
  const [MainComponent, setMainComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setError("Loading timeout - components failed to load")
    }, 10000) // 10 second timeout

    // Try to load the main component
    import("@/components/avatar-bot-main")
      .then((module) => {
        clearTimeout(timeout)
        setMainComponent(() => module.default)
      })
      .catch((err) => {
        clearTimeout(timeout)
        console.error("Failed to load main component:", err)
        setError(`Failed to load components: ${err.message}`)
      })

    return () => clearTimeout(timeout)
  }, [])

  if (!isClient) {
    return <SimpleFallback />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Loading Error</h1>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!MainComponent) {
    return <SimpleFallback />
  }

  return <MainComponent />
}
