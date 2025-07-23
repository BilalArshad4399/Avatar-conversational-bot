import { streamText } from "ai"
import { createAzure } from "@ai-sdk/azure"

const azure = createAzure({
  resourceName: "openaiservices-gosign",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: azure("gpt-4o-pilot-ai-production"),
      messages,
      system: `You are an empathetic AI assistant with emotional intelligence. 
      Respond naturally and show appropriate emotions in your responses. 
      Keep responses concise but engaging for voice conversation.
      
      Analyze the emotional tone of the user's message and respond with:
      - Appropriate emotional context
      - Supportive and understanding tone
      - Clear, conversational language suitable for speech`,
      temperature: 0.7,
      maxTokens: 150,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
