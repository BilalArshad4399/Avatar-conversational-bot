import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Test Azure Speech Services configuration
    const speechEndpoint = process.env.AZURE_SPEECH_ENDPOINT
    const speechKey = process.env.SPEECH_KEY

    // Test endpoint connectivity
    const testEndpoint = `${speechEndpoint}/speechtotext/v3.1/models`

    const response = await fetch(testEndpoint, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": speechKey!,
        Accept: "application/json",
      },
    })

    const isConnected = response.ok
    let models = []

    if (isConnected) {
      try {
        models = await response.json()
      } catch (e) {
        models = ["Connection successful but couldn't parse models"]
      }
    }

    return new Response(
      JSON.stringify({
        message: "Azure Speech Services configuration test",
        endpoint: speechEndpoint,
        hasKey: !!speechKey,
        keyLength: speechKey?.length || 0,
        keyPreview: speechKey ? `${speechKey.substring(0, 8)}...` : "Not set",
        isConnected,
        responseStatus: response.status,
        availableModels: Array.isArray(models) ? models.slice(0, 3) : models,
        testEndpoint,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Azure Speech Services test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
