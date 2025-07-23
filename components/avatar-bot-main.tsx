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
} from "lucide-react"
import { useConversation } from "@/hooks/use-conversation"

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
        className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200"
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

export default function AvatarBotMain() {
  const [isMuted, setIsMuted] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [azureTestResult, setAzureTestResult] = useState<any>(null)

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
    // Mute/unmute speech synthesis
    if (isMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
  }, [isMuted])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Azure AI Avatar Assistant</h1>
          <p className="text-slate-300">Powered by Azure OpenAI GPT-4o + Azure Speech Services</p>
        </div>

        {/* Error Display */}
        {(state.error || error) && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{state.error || error?.message || "Unknown error occurred"}</span>
            </div>
          </div>
        )}

        {/* Test Configuration Buttons */}
        <div className="text-center mb-4 flex gap-2 justify-center flex-wrap">
          <Button
            onClick={testSpeechConfig}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Test Speech
          </Button>
          <Button
            onClick={testAzureOpenAI}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            <Settings className="w-4 h-4 mr-2" />
            Test Azure OpenAI
          </Button>
          <Button
            onClick={testChat}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Test Chat
          </Button>
        </div>

        {/* Test Results */}
        {(testResult || azureTestResult) && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResult && (
              <div className="p-3 bg-slate-800 rounded text-xs text-slate-300">
                <h3 className="font-bold mb-2 text-blue-300">Speech Test Result:</h3>
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            )}
            {azureTestResult && (
              <div className="p-3 bg-slate-800 rounded text-xs text-slate-300">
                <h3 className="font-bold mb-2 text-green-300">Azure OpenAI Test Result:</h3>
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(azureTestResult, null, 2)}
                </pre>
                {azureTestResult.success && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-700 rounded">
                    <span className="text-green-300 font-medium">✅ Azure OpenAI is working!</span>
                  </div>
                )}
                {azureTestResult.success === false && (
                  <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded">
                    <span className="text-red-300 font-medium">❌ Azure OpenAI connection failed</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  AI Avatar
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`${getStatusColor()} text-white border-0`}>
                      {getStatusText()}
                    </Badge>
                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                      Emotion: {state.emotion}
                    </Badge>
                    {state.confidence > 0 && (
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        Confidence: {Math.round(state.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Avatar Display */}
                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                  <SimpleAvatar emotion={state.emotion} isSpeaking={state.isSpeaking} />

                  {state.isListening && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Listening</span>
                      </div>
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-2 bg-yellow-600/80 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">AI Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Visualizer */}
                <div className="mt-4 h-16 bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="flex items-end gap-1 h-8">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-150"
                        style={{
                          height: state.isListening || state.isSpeaking ? `${Math.random() * 80 + 20}%` : "10%",
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Voice Selection */}
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <SimpleVoiceSelector
                    selectedVoice={selectedVoice}
                    availableVoices={availableVoices}
                    onVoiceChange={setSelectedVoice}
                  />
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={state.isListening ? stopListening : startListening}
                    disabled={state.isProcessing || isLoading}
                    size="lg"
                    className={`${
                      state.isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {state.isListening ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Start Listening
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant="outline"
                    size="lg"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-5 h-5 mr-2" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 mr-2" />
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
              <CardHeader>
                <CardTitle className="text-white">Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-slate-400 text-center py-8">
                        Start a conversation by clicking "Start Listening" or test the system with the buttons above
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={message.id || index}
                          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-2 max-w-[80%] ${
                              message.role === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                message.role === "user" ? "bg-blue-600" : "bg-green-600"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div
                              className={`px-4 py-2 rounded-lg ${
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
                      <div className="flex gap-3 justify-start">
                        <div className="flex gap-2 max-w-[80%]">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-600">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
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
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/50 rounded-full backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${error ? "bg-red-400 animate-pulse" : "bg-green-400 animate-pulse"}`}
              ></div>
              <span className="text-slate-300 text-sm">{error ? "Azure OpenAI Error" : "Azure OpenAI Connected"}</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300 text-sm">Model: gpt-4o-pilot-ai-production</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-slate-300 text-sm">Speech: Azure Speech Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
