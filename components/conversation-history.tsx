"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Bot } from "lucide-react"
import type { Message } from "ai"

interface ConversationHistoryProps {
  messages: Message[]
}

export function ConversationHistory({ messages }: ConversationHistoryProps) {
  return (
    <ScrollArea className="h-96 w-full">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-slate-400 text-center py-8">Start a conversation by clicking "Start Listening"</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
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
  )
}
