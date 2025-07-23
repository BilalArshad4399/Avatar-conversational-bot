"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Volume2, Play } from "lucide-react"

interface VoiceSelectorProps {
  selectedVoice: SpeechSynthesisVoice | null
  availableVoices: SpeechSynthesisVoice[]
  onVoiceChange: (voice: SpeechSynthesisVoice) => void
}

export function VoiceSelector({ selectedVoice, availableVoices, onVoiceChange }: VoiceSelectorProps) {
  const testVoice = (voice: SpeechSynthesisVoice) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance("Hello! This is how I sound.")
      utterance.voice = voice
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const getVoiceDisplayName = (voice: SpeechSynthesisVoice) => {
    // Clean up voice names for better display
    let name = voice.name
    if (name.includes("Microsoft")) {
      name = name.replace("Microsoft ", "")
    }
    if (name.includes("Google")) {
      name = name.replace("Google ", "")
    }
    return `${name} (${voice.lang})`
  }

  const categorizeVoices = () => {
    const categories = {
      premium: availableVoices.filter(
        (voice) => voice.name.includes("Neural") || voice.name.includes("Premium") || voice.name.includes("Enhanced"),
      ),
      standard: availableVoices.filter(
        (voice) =>
          !voice.name.includes("Neural") && !voice.name.includes("Premium") && !voice.name.includes("Enhanced"),
      ),
    }
    return categories
  }

  const { premium, standard } = categorizeVoices()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-300">Voice Selection</span>
      </div>

      <div className="flex gap-2">
        <Select
          value={selectedVoice?.name || ""}
          onValueChange={(voiceName) => {
            const voice = availableVoices.find((v) => v.name === voiceName)
            if (voice) onVoiceChange(voice)
          }}
        >
          <SelectTrigger className="flex-1 bg-slate-700 border-slate-600 text-slate-200">
            <SelectValue placeholder="Select a voice..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {premium.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Premium Voices
                </div>
                {premium.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name} className="text-slate-200 focus:bg-slate-700">
                    <div className="flex items-center justify-between w-full">
                      <span>{getVoiceDisplayName(voice)}</span>
                      <span className="text-xs text-green-400 ml-2">✨</span>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}

            {standard.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide mt-2">
                  Standard Voices
                </div>
                {standard.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name} className="text-slate-200 focus:bg-slate-700">
                    {getVoiceDisplayName(voice)}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        {selectedVoice && (
          <Button
            onClick={() => testVoice(selectedVoice)}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Play className="w-4 h-4" />
          </Button>
        )}
      </div>

      {selectedVoice && (
        <div className="text-xs text-slate-400">
          Selected: {getVoiceDisplayName(selectedVoice)}
          {selectedVoice.name.includes("Neural") && <span className="ml-2 text-green-400">• High Quality</span>}
        </div>
      )}
    </div>
  )
}
