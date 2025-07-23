import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Test Azure OpenAI configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deploymentName = process.env.DEPLOYMENT_NAME

    // Extract base endpoint for testing
    const baseEndpoint = endpoint?.split("/chat/completions")[0]
    const testEndpoint = `${baseEndpoint}/chat/completions?api-version=2025-01-01-preview`

    console.log("Testing Azure OpenAI with endpoint:", testEndpoint)

    // Test with a simple message
    const testPayload = {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello" },
      ],
      max_tokens: 50,
      temperature: 0.7,
    }

    const response = await fetch(testEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey!,
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    console.log("Azure OpenAI response:", response.status, responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      result = { raw_response: responseText }
    }

    return new Response(
      JSON.stringify({
        message: "Azure OpenAI configuration test",
        endpoint: testEndpoint,
        hasApiKey: !!apiKey,
        keyLength: apiKey?.length || 0,
        keyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : "Not set",
        deploymentName,
        isConnected: response.ok,
        responseStatus: response.status,
        responseData: result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Azure OpenAI test error:", error)
    return new Response(
      JSON.stringify({
        error: "Azure OpenAI test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
