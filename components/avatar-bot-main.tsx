"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Bot,
  Headphones,
  MessageSquare,
  AlertCircle,
  Settings,
  Smartphone,
  Shield,
} from "lucide-react"
import { useConversation } from "@/hooks/use-conversation"

// Mobile detection
function isMobileDevice() {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Check if HTTPS
function isHTTPS() {
  if (typeof window === "undefined") return false
  return window.location.protocol === "https:"
}

// Simple avatar placeholder
function SimpleAvatar({ emotion, isSpeaking }: { emotion: string; isSpeaking: boolean }) {
  const getEmotionColor = () => {
    switch (emotion) {
      case "happy":
        return "bg-yellow-400"
      case "sad":
        return "bg-blue-400"
      case "excited":
        return "bg-red-400"
      case "concerned":
        return "bg-purple-400"
      default:
        return "bg-green-400"
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg relative">
      <div
        className={`w-32 h-32 rounded-full ${getEmotionColor()} flex items-center justify-center transition-all duration-300 ${isSpeaking ? "scale-110 animate-pulse" : ""}`}
      >
        <div className="text-4xl">🤖</div>
      </div>
      {isSpeaking && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-blue-600/80 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Speaking</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple voice selector
function SimpleVoiceSelector({
  selectedVoice,
  availableVoices,
  onVoiceChange,
}: {
  selectedVoice: SpeechSynthesisVoice | null
  availableVoices: SpeechSynthesisVoice[]
  onVoiceChange: (voice: SpeechSynthesisVoice) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-300">Voice Selection</span>
      </div>
      <select
        className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
        value={selectedVoice?.name || ""}
        onChange={(e) => {
          const voice = availableVoices.find((v) => v.name === e.target.value)
          if (voice) onVoiceChange(voice)
        }}
      >
        <option value="">Select a voice...</option>
        {availableVoices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
    </div>
  )
}

// Mobile compatibility checker
function MobileCompatibilityChecker() {
  const [checks, setChecks] = useState({
    isMobile: false,
    isHTTPS: false,
    hasWebSpeech: false,
    hasMicrophone: false,
    hasPermission: false,
  })

  useEffect(() => {
    const runChecks = async () => {
      const isMobile = isMobileDevice()
      const isSecure = isHTTPS()
      const hasWebSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window

      let hasMicrophone = false
      let hasPermission = false

      try {
        // Check if microphone is available
        const devices = await navigator.mediaDevices.enumerateDevices()
        hasMicrophone = devices.some((device) => device.kind === "audioinput")

        // Check microphone permission
        const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
        hasPermission = permission.state === "granted"
      } catch (error) {
        console.log("Permission check failed:", error)
      }

      setChecks({
        isMobile,
        isHTTPS: isSecure,
        hasWebSpeech,
        hasMicrophone,
        hasPermission,
      })
    }

    runChecks()
  }, [])

  return (
    <div className="mb-4 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
        <Smartphone className="w-4 h-4" />
        System Compatibility
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${checks.isMobile ? "bg-blue-400" : "bg-gray-400"}`}></div>
          <span className="text-slate-300">Mobile Device: {checks.isMobile ? "Yes" : "No"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${checks.isHTTPS ? "bg-green-400" : "bg-red-400"}`}></div>
          <span className="text-slate-300">HTTPS: {checks.isHTTPS ? "Secure" : "Not Secure"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${checks.hasWebSpeech ? "bg-green-400" : "bg-red-400"}`}></div>
          <span className="text-slate-300">Web Speech: {checks.hasWebSpeech ? "Supported" : "Not Supported"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${checks.hasMicrophone ? "bg-green-400" : "bg-red-400"}`}></div>
          <span className="text-slate-300">Microphone: {checks.hasMicrophone ? "Available" : "Not Found"}</span>
        </div>
      </div>

      {!checks.isHTTPS && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded">
          <div className="flex items-center gap-2 text-red-200">
            <Shield className="w-4 h-4" />
            <span className="font-medium">HTTPS Required:</span>
            <span className="text-sm">Speech recognition requires a secure connection on mobile devices.</span>
          </div>
        </div>
      )}

      {checks.isMobile && !checks.hasWebSpeech && (
        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded">
          <div className="flex items-center gap-2 text-yellow-200">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Limited Support:</span>
            <span className="text-sm">
              Your mobile browser has limited speech recognition support. Try Chrome or Safari.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AvatarBotMain() {
  const [isMuted, setIsMuted] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [azureTestResult, setAzureTestResult] = useState<any>(null)
  const [showCompatibility, setShowCompatibility] = useState(false)

  const {
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
  } = useConversation()

  useEffect(() => {
    // Show compatibility checker on mobile
    if (isMobileDevice()) {
      setShowCompatibility(true)
    }

    // Mute/unmute speech synthesis
    if (isMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
  }, [isMuted])

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
      alert("Microphone permission granted! You can now use speech recognition.")
      setShowCompatibility(false)
    } catch (error) {
      console.error("Microphone permission denied:", error)
      alert(
        "Microphone permission is required for speech recognition. Please allow microphone access in your browser settings.",
      )
    }
  }

  const testSpeechConfig = async () => {
    try {
      const response = await fetch("/api/test-speech")
      const result = await response.json()
      setTestResult(result)
      console.log("Azure Speech config test:", result)
    } catch (error) {
      console.error("Speech test failed:", error)
      setTestResult({ error: "Speech test failed" })
    }
  }

  const testAzureOpenAI = async () => {
    try {
      const response = await fetch("/api/test-azure-openai")
      const result = await response.json()
      setAzureTestResult(result)
      console.log("Azure OpenAI test:", result)
    } catch (error) {
      console.error("Azure OpenAI test failed:", error)
      setAzureTestResult({ error: "Azure OpenAI test failed" })
    }
  }

  const getStatusColor = () => {
    if (state.error) return "bg-red-500"
    if (state.isListening) return "bg-red-500"
    if (state.isSpeaking) return "bg-blue-500"
    if (state.isProcessing || isLoading) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusText = () => {
    if (state.error) return "Error"
    if (state.isListening) return "Listening..."
    if (state.isSpeaking) return "Speaking..."
    if (state.isProcessing) return "Processing..."
    if (isLoading) return "Thinking..."
    return "Ready"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Azure AI Avatar Assistant</h1>
          <p className="text-slate-300 text-sm sm:text-base">Powered by Azure OpenAI GPT-4o + Azure Speech Services</p>
        </div>

        {/* Mobile Compatibility Checker */}
        {showCompatibility && <MobileCompatibilityChecker />}

        {/* Permission Request for Mobile */}
        {isMobileDevice() && (
          <div className="mb-4 text-center">
            <Button
              onClick={requestMicrophonePermission}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Mic className="w-4 h-4 mr-2" />
              Enable Microphone
            </Button>
            <p className="text-xs text-slate-400 mt-2">Tap to grant microphone permission for speech recognition</p>
          </div>
        )}

        {/* Error Display */}
        {(state.error || error) && (
          <div className="mb-4 p-3 sm:p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Error:</span>
              <span className="text-sm sm:text-base">{state.error || error?.message || "Unknown error occurred"}</span>
            </div>
          </div>
        )}

        {/* Test Configuration Buttons */}
        <div className="text-center mb-4 flex gap-1 sm:gap-2 justify-center flex-wrap">
          <Button
            onClick={testSpeechConfig}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent text-xs sm:text-sm"
          >
            <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Test Speech
          </Button>
          <Button
            onClick={testAzureOpenAI}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent text-xs sm:text-sm"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Test Azure
          </Button>
          <Button
            onClick={testChat}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent text-xs sm:text-sm"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Test Chat
          </Button>
          <Button
            onClick={() => setShowCompatibility(!showCompatibility)}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent text-xs sm:text-sm"
          >
            <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            System Info
          </Button>
        </div>

        {/* Test Results */}
        {(testResult || azureTestResult) && (
          <div className="mb-4 grid grid-cols-1 gap-4">
            {testResult && (
              <div className="p-3 bg-slate-800 rounded text-xs text-slate-300">
                <h3 className="font-bold mb-2 text-blue-300">Speech Test Result:</h3>
                <pre className="whitespace-pre-wrap overflow-auto max-h-32 text-xs">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
            {azureTestResult && (
              <div className="p-3 bg-slate-800 rounded text-xs text-slate-300">
                <h3 className="font-bold mb-2 text-green-300">Azure OpenAI Test Result:</h3>
                <pre className="whitespace-pre-wrap overflow-auto max-h-32 text-xs">
                  {JSON.stringify(azureTestResult, null, 2)}
                </pre>
                {azureTestResult.success && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-700 rounded">
                    <span className="text-green-300 font-medium text-xs">✅ Azure OpenAI is working!</span>
                  </div>
                )}
                {azureTestResult.success === false && (
                  <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded">
                    <span className="text-red-300 font-medium text-xs">❌ Azure OpenAI connection failed</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Avatar Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-lg sm:text-xl">AI Avatar</span>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge variant="secondary" className={`${getStatusColor()} text-white border-0 text-xs`}>
                      {getStatusText()}
                    </Badge>
                    <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                      {state.emotion}
                    </Badge>
                    {state.confidence > 0 && (
                      <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                        {Math.round(state.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Display */}
                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                  <SimpleAvatar emotion={state.emotion} isSpeaking={state.isSpeaking} />

                  {state.isListening && (
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <div className="flex items-center gap-2 bg-red-600/80 px-2 sm:px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-xs sm:text-sm font-medium">Listening</span>
                      </div>
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
                      <div className="flex items-center gap-2 bg-yellow-600/80 px-2 sm:px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-xs sm:text-sm font-medium">AI Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Visualizer */}
                <div className="h-12 sm:h-16 bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="flex items-end gap-1 h-6 sm:h-8">
                    {Array.from({ length: isMobileDevice() ? 15 : 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 sm:w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-150"
                        style={{
                          height: state.isListening || state.isSpeaking ? `${Math.random() * 80 + 20}%` : "10%",
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Voice Selection */}
                <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg">
                  <SimpleVoiceSelector
                    selectedVoice={selectedVoice}
                    availableVoices={availableVoices}
                    onVoiceChange={setSelectedVoice}
                  />
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-2 sm:gap-4">
                  <Button
                    onClick={state.isListening ? stopListening : startListening}
                    disabled={state.isProcessing || isLoading}
                    size={isMobileDevice() ? "default" : "lg"}
                    className={`${
                      state.isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white text-sm sm:text-base`}
                  >
                    {state.isListening ? (
                      <>
                        <MicOff className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        Listen
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant="outline"
                    size={isMobileDevice() ? "default" : "lg"}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm sm:text-base"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        Mute
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation History */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-full">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-white text-lg sm:text-xl">Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 sm:h-96 w-full">
                  <div className="space-y-3 sm:space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-slate-400 text-center py-4 sm:py-8 text-sm sm:text-base">
                        Start a conversation by clicking "Listen" or test the system with the buttons above
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={message.id || index}
                          className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-2 max-w-[85%] sm:max-w-[80%] ${
                              message.role === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                message.role === "user" ? "bg-blue-600" : "bg-green-600"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              ) : (
                                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              )}
                            </div>
                            <div
                              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                                message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex gap-2 sm:gap-3 justify-start">
                        <div className="flex gap-2 max-w-[80%]">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-green-600">
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="px-3 sm:px-4 py-2 rounded-lg bg-slate-700 text-slate-100">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-4 sm:mt-6 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-slate-800/50 rounded-full backdrop-blur-sm text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${error ? "bg-red-400 animate-pulse" : "bg-green-400 animate-pulse"}`}
              ></div>
              <span className="text-slate-300">{error ? "Azure Error" : "Azure OK"}</span>
            </div>
            <div className="w-px h-3 sm:h-4 bg-slate-600"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">GPT-4o</span>
            </div>
            <div className="w-px h-3 sm:h-4 bg-slate-600"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full"></div>
              <span className="text-slate-300">Speech</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
