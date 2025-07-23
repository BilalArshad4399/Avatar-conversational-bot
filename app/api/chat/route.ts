import { streamText } from "ai"
import { createAzure } from "@ai-sdk/azure"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    console.log("=== CHAT API DEBUG ===")
    console.log("Messages received:", JSON.stringify(messages, null, 2))
    console.log("Azure OpenAI API Key exists:", !!process.env.AZURE_OPENAI_API_KEY)
    console.log("Azure OpenAI Endpoint:", process.env.AZURE_OPENAI_ENDPOINT)
    console.log("Deployment Name:", process.env.DEPLOYMENT_NAME)

    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error("AZURE_OPENAI_API_KEY is not configured")
    }

    if (!process.env.DEPLOYMENT_NAME) {
      throw new Error("DEPLOYMENT_NAME is not configured")
    }

    // Extract the base URL from the full endpoint
    const fullEndpoint = process.env.AZURE_OPENAI_ENDPOINT!
    const baseUrl = fullEndpoint.split("/openai/deployments/")[0]
    const resourceName = baseUrl.split("https://")[1].split(".openai.azure.com")[0]

    console.log("Extracted base URL:", baseUrl)
    console.log("Extracted resource name:", resourceName)

    // Create Azure client with correct configuration
    const azure = createAzure({
      resourceName: resourceName,
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      apiVersion: "2025-01-01-preview",
    })

    const deploymentName = process.env.DEPLOYMENT_NAME

    console.log("Using deployment:", deploymentName)
    console.log("Azure client configured successfully")

    const result = streamText({
      model: azure(deploymentName),
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

    console.log("Azure OpenAI request initiated successfully")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("=== CHAT API ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorDetails = {
      error: "Failed to process chat request",
      details: errorMessage,
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
      hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
      hasDeployment: !!process.env.DEPLOYMENT_NAME,
      fullEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deploymentName: process.env.DEPLOYMENT_NAME,
    }

    console.error("Returning error response:", errorDetails)

    return new Response(JSON.stringify(errorDetails), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
