import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    console.log("=== DIRECT CHAT API ===")
    console.log("Messages:", JSON.stringify(messages, null, 2))

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deploymentName = process.env.DEPLOYMENT_NAME

    if (!endpoint || !apiKey || !deploymentName) {
      throw new Error("Missing Azure OpenAI configuration")
    }

    // Extract the base URL and construct the correct endpoint
    const baseUrl = endpoint.split("/openai/deployments/")[0]
    const chatEndpoint = `${baseUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=2025-01-01-preview`

    console.log("Using endpoint:", chatEndpoint)

    // Add system message if not present
    const systemMessage = {
      role: "system",
      content: `You are an empathetic AI assistant with emotional intelligence. 
      Respond naturally and show appropriate emotions in your responses. 
      Keep responses concise but engaging for voice conversation.
      
      Always respond to the user's query directly and helpfully.`,
    }

    const messagesWithSystem = messages[0]?.role === "system" ? messages : [systemMessage, ...messages]

    const payload = {
      messages: messagesWithSystem,
      max_tokens: 150,
      temperature: 0.7,
      stream: false, // Use non-streaming for simplicity
    }

    console.log("Sending payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(chatEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Azure OpenAI error:", errorText)
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Azure OpenAI response:", result)

    if (result.choices && result.choices.length > 0) {
      const assistantMessage = result.choices[0].message.content

      return new Response(
        JSON.stringify({
          success: true,
          message: assistantMessage,
          usage: result.usage,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    } else {
      throw new Error("No response from Azure OpenAI")
    }
  } catch (error) {
    console.error("Direct chat error:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : "No stack trace",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
