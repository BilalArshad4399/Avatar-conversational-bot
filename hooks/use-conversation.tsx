"use client"

import { useState, useCallback, useRef } from "react"
import { useChat } from "ai/react"
import type { SpeechRecognition } from "web-speech-api"

interface ConversationState {
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  audioLevel: number
  emotion: string
  confidence: number
}

export function useConversation() {
  const [state, setState] = useState<ConversationState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    audioLevel: 0,
    emotion: "neutral",
    confidence: 0,
  })

  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      // Analyze emotion from response
      const emotion = analyzeEmotion(message.content)
      setState((prev) => ({ ...prev, emotion, isSpeaking: true }))

      // Convert to speech
      speakText(message.content)
    },
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const analyzeEmotion = (text: string): string => {
    // Simple emotion analysis - in production, use Azure Cognitive Services
    const emotions = {
      happy: ["great", "wonderful", "amazing", "excellent", "fantastic"],
      sad: ["sorry", "unfortunately", "sad", "disappointed"],
      excited: ["exciting", "awesome", "incredible", "wow"],
      concerned: ["concerned", "worried", "careful", "caution"],
    }

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
        return emotion
      }
    }
    return "neutral"
  }

  const speakText = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true }))
      }

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }))
      }

      speechSynthesis.speak(utterance)
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      // Start audio recording for Azure Whisper
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await processAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      // Also use Web Speech API for real-time feedback
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onresult = (event) => {
          const result = event.results[event.results.length - 1]
          if (result.isFinal) {
            const confidence = result[0].confidence || 0.8
            setState((prev) => ({ ...prev, confidence }))
          }
        }

        recognition.start()
      }

      mediaRecorder.start()
      setState((prev) => ({ ...prev, isListening: true }))

      // Auto-stop after 10 seconds
      setTimeout(() => {
        stopListening()
      }, 10000)
    } catch (error) {
      console.error("Error starting speech recognition:", error)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setState((prev) => ({ ...prev, isListening: false }))
  }, [])

  const processAudio = async (audioBlob: Blob) => {
    setState((prev) => ({ ...prev, isProcessing: true }))

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "audio.wav")

      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to transcribe audio")
      }

      const { text, confidence } = await response.json()

      if (text.trim()) {
        setState((prev) => ({ ...prev, confidence }))
        await append({ role: "user", content: text })
      }
    } catch (error) {
      console.error("Error processing audio:", error)
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }))
    }
  }

  return {
    messages,
    state,
    startListening,
    stopListening,
    isLoading,
  }
}
