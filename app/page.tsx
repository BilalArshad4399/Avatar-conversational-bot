"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamic imports to prevent SSR issues
const HumanAvatarCanvas = dynamic(() => import("@/components/human-avatar").then((mod) => mod.HumanAvatarCanvas), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  ),
})

const VoiceSelector = dynamic(() => import("@/components/voice-selector").then((mod) => mod.VoiceSelector), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-300">Loading voices...</span>
      </div>
    </div>
  ),
})

const AvatarBotMain = dynamic(() => import("@/components/avatar-bot-main"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Loading Avatar Assistant...</h1>
        <p className="text-slate-300">Initializing AI components</p>
      </div>
    </div>
  ),
})

export default function AvatarBot() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
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

  return <AvatarBotMain />
}
