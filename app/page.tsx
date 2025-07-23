"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Volume2, VolumeX, User, Bot, Headphones } from "lucide-react"
import { useConversation } from "@/hooks/use-conversation"

export default function AvatarBot() {
  const { messages, state, startListening, stopListening, isLoading } = useConversation()
  const [isMuted, setIsMuted] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    // Mute/unmute speech synthesis
    if (isMuted) {
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
      console.error("Test failed:", error)
      setTestResult({ error: "Test failed" })
    }
  }

  const getStatusColor = () => {
    if (state.isListening) return "bg-red-500"
    if (state.isSpeaking) return "bg-blue-500"
    if (state.isProcessing || isLoading) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusText = () => {
    if (state.isListening) return "Listening..."
    if (state.isSpeaking) return "Speaking..."
    if (state.isProcessing) return "Processing..."
    if (isLoading) return "Thinking..."
    return "Ready"
  }

  const getAvatarColor = () => {
    switch (state.emotion) {
      case "happy":
        return "bg-yellow-400"
      case "sad":
        return "bg-blue-400"
      case "excited":
        return "bg-orange-400"
      case "concerned":
        return "bg-red-400"
      default:
        return "bg-green-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Azure AI Avatar Assistant</h1>
          <p className="text-slate-300">Powered by Azure OpenAI GPT-4o + Azure Speech Services</p>
        </div>

        {/* Test Configuration Button */}
        <div className="text-center mb-4">
          <Button
            onClick={testSpeechConfig}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Test Speech Config
          </Button>
          {testResult && (
            <div className="mt-2 p-2 bg-slate-800 rounded text-xs text-slate-300 max-w-md mx-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}
        </div>

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
                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative">
                  <div
                    className={`w-32 h-32 rounded-full ${getAvatarColor()} transition-all duration-500 flex items-center justify-center ${state.isSpeaking ? "animate-pulse scale-110" : ""}`}
                  >
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  {state.isSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full border-4 border-white/30 animate-ping"></div>
                    </div>
                  )}
                  {state.isListening && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Recording</span>
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
                        className={`w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-150 ${
                          state.isListening || state.isSpeaking ? `h-${Math.floor(Math.random() * 8) + 1}` : "h-1"
                        }`}
                        style={{
                          height: state.isListening || state.isSpeaking ? `${Math.random() * 100 + 10}%` : "10%",
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
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
                        Start a conversation by clicking "Start Listening"
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
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Azure OpenAI Connected</span>
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
