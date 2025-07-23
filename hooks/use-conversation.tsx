"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useChat } from "ai/react"

// Define types to avoid TypeScript issues
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface ConversationState {
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  audioLevel: number
  emotion: string
  confidence: number
  error: string | null
}

// Mobile detection
function isMobileDevice() {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function useConversation() {
  const [state, setState] = useState<ConversationState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    audioLevel: 0,
    emotion: "neutral",
    confidence: 0,
    error: null,
  })

  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadVoices = () => {
      if ("speechSynthesis" in window) {
        const voices = speechSynthesis.getVoices()
        const englishVoices = voices.filter((voice) => voice.lang.startsWith("en"))
        setAvailableVoices(englishVoices)

        // Set default voice (prefer Neural or Premium voices)
        const defaultVoice =
          englishVoices.find((voice) => voice.name.includes("Neural") || voice.name.includes("Premium")) ||
          englishVoices[0]

        if (defaultVoice && !selectedVoice) {
          setSelectedVoice(defaultVoice)
        }
      }
    }

    loadVoices()
    if ("speechSynthesis" in window) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [selectedVoice])

  const { messages, append, isLoading, error } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      console.log("Chat response received:", message)

      // Analyze emotion from response
      const emotion = analyzeEmotion(message.content)
      setState((prev) => ({ ...prev, emotion, isSpeaking: true, error: null }))

      // Convert to speech
      speakText(message.content)
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to get response from AI",
        isSpeaking: false,
      }))
    },
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const webSpeechTextRef = useRef<string>("")
  const audioContextRef = useRef<AudioContext | null>(null)

  const analyzeEmotion = (text: string): string => {
    const lowerText = text.toLowerCase()

    // Enhanced emotion analysis with scoring
    const emotions = {
      happy: {
        keywords: [
          "great",
          "wonderful",
          "amazing",
          "excellent",
          "fantastic",
          "awesome",
          "brilliant",
          "love",
          "perfect",
          "good",
          "nice",
          "pleased",
          "delighted",
          "thrilled",
          "excited",
          "joy",
          "happy",
          "glad",
          "cheerful",
        ],
        score: 0,
      },
      sad: {
        keywords: [
          "sorry",
          "unfortunately",
          "sad",
          "disappointed",
          "regret",
          "apologize",
          "terrible",
          "awful",
          "bad",
          "upset",
          "depressed",
          "unhappy",
          "miserable",
          "tragic",
          "heartbreaking",
        ],
        score: 0,
      },
      excited: {
        keywords: [
          "exciting",
          "awesome",
          "incredible",
          "wow",
          "fantastic",
          "amazing",
          "unbelievable",
          "thrilled",
          "energetic",
          "enthusiastic",
          "pumped",
          "fired up",
          "can't wait",
          "amazing",
        ],
        score: 0,
      },
      concerned: {
        keywords: [
          "concerned",
          "worried",
          "careful",
          "caution",
          "warning",
          "problem",
          "issue",
          "trouble",
          "difficult",
          "challenging",
          "serious",
          "urgent",
          "important",
          "critical",
        ],
        score: 0,
      },
    }

    // Calculate scores for each emotion
    for (const [emotion, data] of Object.entries(emotions)) {
      data.score = data.keywords.reduce((score, keyword) => {
        const matches = (lowerText.match(new RegExp(keyword, "g")) || []).length
        return score + matches
      }, 0)
    }

    // Find the emotion with the highest score
    const topEmotion = Object.entries(emotions).reduce(
      (max, [emotion, data]) => (data.score > max.score ? { emotion, score: data.score } : max),
      { emotion: "neutral", score: 0 },
    )

    console.log("Emotion analysis:", emotions, "Selected:", topEmotion.emotion)

    return topEmotion.score > 0 ? topEmotion.emotion : "neutral"
  }

  const speakText = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return

      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8

      // Use selected voice or find a good default
      if (selectedVoice) {
        utterance.voice = selectedVoice
      } else {
        const voices = speechSynthesis.getVoices()
        const preferredVoice = voices.find(
          (voice) => voice.name.includes("Neural") || voice.name.includes("Premium") || voice.lang.startsWith("en-US"),
        )
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
      }

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true }))
      }

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }))
      }

      utterance.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }))
      }

      speechSynthesis.speak(utterance)
    },
    [selectedVoice],
  )

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    try {
      if (typeof window === "undefined") return audioBlob

      // Create audio context for processing
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)

      // Convert to WAV format (16-bit PCM, 16kHz sample rate for Azure Speech)
      const length = audioBuffer.length
      const sampleRate = 16000 // Azure Speech Services prefers 16kHz
      const channels = 1 // Mono

      // Resample if necessary
      let samples: Float32Array
      if (audioBuffer.sampleRate !== sampleRate) {
        const ratio = audioBuffer.sampleRate / sampleRate
        const newLength = Math.round(length / ratio)
        samples = new Float32Array(newLength)

        for (let i = 0; i < newLength; i++) {
          const index = Math.floor(i * ratio)
          samples[i] = audioBuffer.getChannelData(0)[index] || 0
        }
      } else {
        samples = audioBuffer.getChannelData(0)
      }

      // Create WAV file
      const buffer = new ArrayBuffer(44 + samples.length * 2)
      const view = new DataView(buffer)

      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }

      writeString(0, "RIFF")
      view.setUint32(4, 36 + samples.length * 2, true)
      writeString(8, "WAVE")
      writeString(12, "fmt ")
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, channels, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * channels * 2, true)
      view.setUint16(32, channels * 2, true)
      view.setUint16(34, 16, true)
      writeString(36, "data")
      view.setUint32(40, samples.length * 2, true)

      // Convert samples to 16-bit PCM
      let offset = 44
      for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]))
        view.setInt16(offset, sample * 0x7fff, true)
        offset += 2
      }

      return new Blob([buffer], { type: "audio/wav" })
    } catch (error) {
      console.error("Error converting to WAV:", error)
      return audioBlob // Return original if conversion fails
    }
  }

  const startListening = useCallback(async () => {
    if (typeof window === "undefined") return

    try {
      // Clear any previous errors
      setState((prev) => ({ ...prev, error: null }))

      // Check HTTPS requirement for mobile
      if (isMobileDevice() && window.location.protocol !== "https:") {
        setState((prev) => ({
          ...prev,
          error: "HTTPS is required for speech recognition on mobile devices",
        }))
        return
      }

      // Reset previous text
      webSpeechTextRef.current = ""

      // Request microphone permission explicitly
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      } catch (permissionError) {
        console.error("Microphone permission denied:", permissionError)
        setState((prev) => ({
          ...prev,
          error: "Microphone permission denied. Please allow microphone access and try again.",
        }))
        return
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

        // Use both Web Speech API result and Azure Speech Services
        if (webSpeechTextRef.current.trim()) {
          console.log("Using Web Speech API result:", webSpeechTextRef.current)
          setState((prev) => ({ ...prev, confidence: 0.9 }))

          try {
            await append({ role: "user", content: webSpeechTextRef.current })
          } catch (error) {
            console.error("Error appending message:", error)
            // Try direct API call as fallback
            await tryDirectChat(webSpeechTextRef.current)
          }
        } else {
          // Fallback to Azure Speech Services
          await processAudioWithAzureSpeech(audioBlob)
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      // Primary: Use Web Speech API for real-time recognition
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition

        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onresult = (event) => {
          const result = event.results[0]
          if (result.isFinal) {
            const transcript = result[0].transcript
            const confidence = result[0].confidence || 0.8

            console.log("Web Speech API result:", transcript, "confidence:", confidence)
            webSpeechTextRef.current = transcript
            setState((prev) => ({ ...prev, confidence }))
          }
        }

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error)

          let errorMessage = "Speech recognition error"
          switch (event.error) {
            case "not-allowed":
              errorMessage = "Microphone access denied. Please allow microphone permission."
              break
            case "no-speech":
              errorMessage = "No speech detected. Please try speaking again."
              break
            case "network":
              errorMessage = "Network error. Please check your internet connection."
              break
            case "service-not-allowed":
              errorMessage = "Speech service not allowed. Please use HTTPS."
              break
            default:
              errorMessage = `Speech recognition error: ${event.error}`
          }

          setState((prev) => ({ ...prev, error: errorMessage }))
        }

        recognition.onend = () => {
          console.log("Speech recognition ended")
          // Stop audio recording
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
          }
        }

        recognition.start()
      } else {
        setState((prev) => ({
          ...prev,
          error: "Speech recognition not supported in this browser. Try Chrome or Safari.",
        }))
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      mediaRecorder.start()
      setState((prev) => ({ ...prev, isListening: true }))

      // Auto-stop after 10 seconds (shorter for mobile)
      const timeout = isMobileDevice() ? 8000 : 10000
      setTimeout(() => {
        stopListening()
      }, timeout)
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: "Failed to start listening. Please check microphone permissions and try again.",
      }))
    }
  }, [append])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setState((prev) => ({ ...prev, isListening: false }))
  }, [])

  const processAudioWithAzureSpeech = async (audioBlob: Blob) => {
    setState((prev) => ({ ...prev, isProcessing: true }))

    try {
      console.log("Processing audio with Azure Speech Services:", audioBlob.size, "bytes")

      // Convert to WAV format for better Azure Speech compatibility
      const wavBlob = await convertToWav(audioBlob)
      console.log("Converted to WAV:", wavBlob.size, "bytes")

      const formData = new FormData()
      formData.append("audio", wavBlob, "audio.wav")

      const response = await fetch("/api/speech", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Azure Speech API response:", result)

      if (response.ok && result.text && result.text.trim()) {
        setState((prev) => ({ ...prev, confidence: result.confidence || 0.8 }))

        try {
          await append({ role: "user", content: result.text })
        } catch (error) {
          console.error("Error appending Azure Speech result:", error)
          // Try direct API call as fallback
          await tryDirectChat(result.text)
        }
      } else if (result.error) {
        console.warn("Azure Speech failed:", result.error)
        setState((prev) => ({
          ...prev,
          error: "Speech recognition failed. Please try speaking again.",
        }))
      }
    } catch (error) {
      console.error("Error processing audio with Azure Speech:", error)
      setState((prev) => ({
        ...prev,
        error: "Failed to process audio. Please try again.",
      }))
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }))
    }
  }

  // Direct API call as fallback when AI SDK fails
  const tryDirectChat = async (userMessage: string) => {
    try {
      console.log("Trying direct chat API as fallback...")
      setState((prev) => ({ ...prev, isProcessing: true }))

      const response = await fetch("/api/chat-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
        }),
      })

      const result = await response.json()
      console.log("Direct chat result:", result)

      if (result.success && result.message) {
        // Analyze emotion and speak the response
        const emotion = analyzeEmotion(result.message)
        setState((prev) => ({ ...prev, emotion, isSpeaking: true, error: null }))
        speakText(result.message)
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || "Direct chat failed",
        }))
      }
    } catch (error) {
      console.error("Direct chat error:", error)
      setState((prev) => ({
        ...prev,
        error: "All chat methods failed. Please check your configuration.",
      }))
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }))
    }
  }

  // Test chat functionality
  const testChat = useCallback(async () => {
    try {
      console.log("Testing chat functionality...")
      await append({ role: "user", content: "Hello, can you hear me?" })
    } catch (error) {
      console.error("Chat test failed, trying direct API:", error)
      await tryDirectChat("Hello, can you hear me?")
    }
  }, [append])

  return {
    messages,
    state,
    startListening,
    stopListening,
    testChat,
    isLoading,
    error,
    selectedVoice,
    availableVoices,
    setSelectedVoice,
  }
}
