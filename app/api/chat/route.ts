import { streamText } from "ai"
import { createAzure } from "@ai-sdk/azure"

const azure = createAzure({
  resourceName: "openaiservices-gosign",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    console.log("Chat API called with messages:", messages)
    console.log("Azure OpenAI API Key exists:", !!process.env.AZURE_OPENAI_API_KEY)
    console.log("Azure OpenAI Endpoint:", process.env.AZURE_OPENAI_ENDPOINT)

    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error("AZURE_OPENAI_API_KEY is not configured")
    }

    const result = streamText({
      model: azure("gpt-4o-pilot-ai-production"),
      messages,
      system: `You are an empathetic AI assistant with emotional intelligence. 
      Respond naturally and show appropriate emotions in your responses. 
      Keep responses concise but engaging for voice conversation.
      
      Analyze the emotional tone of the user's message and respond with:
      - Appropriate emotional context
      - Supportive and understanding tone
      - Clear, conversational language suitable for speech
      
      Always respond to the user's query directly and helpfully.`,
      temperature: 0.7,
      maxTokens: 150,
    })

    console.log("Azure OpenAI request successful")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)

    // Return a detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
