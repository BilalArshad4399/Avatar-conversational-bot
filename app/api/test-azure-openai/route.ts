import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    console.log("=== TESTING AZURE OPENAI DIRECT ===")

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deploymentName = process.env.DEPLOYMENT_NAME

    console.log("Endpoint:", endpoint)
    console.log("Has API Key:", !!apiKey)
    console.log("API Key length:", apiKey?.length)
    console.log("Deployment Name:", deploymentName)

    if (!endpoint || !apiKey || !deploymentName) {
      return new Response(
        JSON.stringify({
          error: "Missing configuration",
          hasEndpoint: !!endpoint,
          hasApiKey: !!apiKey,
          hasDeployment: !!deploymentName,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Extract the base URL and construct the correct endpoint
    const baseUrl = endpoint.split("/openai/deployments/")[0]
    const testEndpoint = `${baseUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=2025-01-01-preview`

    console.log("Test endpoint:", testEndpoint)

    // Test with a simple message
    const testPayload = {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello in one sentence." },
      ],
      max_tokens: 50,
      temperature: 0.7,
    }

    console.log("Sending test payload:", JSON.stringify(testPayload, null, 2))

    const response = await fetch(testEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(testPayload),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("Response text:", responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      result = { raw_response: responseText, parse_error: e.message }
    }

    return new Response(
      JSON.stringify({
        message: "Azure OpenAI direct test",
        testEndpoint,
        hasApiKey: !!apiKey,
        keyLength: apiKey?.length || 0,
        keyPreview: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : "Not set",
        deploymentName,
        isConnected: response.ok,
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseData: result,
        success: response.ok && result.choices && result.choices.length > 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("=== AZURE OPENAI TEST ERROR ===")
    console.error("Error:", error)

    return new Response(
      JSON.stringify({
        error: "Azure OpenAI test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
