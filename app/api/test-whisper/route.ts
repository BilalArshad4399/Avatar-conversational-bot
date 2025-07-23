import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Test Azure OpenAI Whisper endpoint configuration
    const baseEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.split("/chat/completions")[0]
    const whisperEndpoint = `${baseEndpoint}/audio/transcriptions?api-version=2024-02-01`

    return new Response(
      JSON.stringify({
        message: "Whisper endpoint test",
        baseEndpoint,
        whisperEndpoint,
        hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
        apiKeyLength: process.env.AZURE_OPENAI_API_KEY?.length || 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Configuration test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
