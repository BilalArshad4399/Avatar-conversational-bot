import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Convert File to FormData for Azure OpenAI Whisper
    const whisperFormData = new FormData()
    whisperFormData.append("file", audioFile)
    whisperFormData.append("model", "whisper-1")

    const response = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT?.replace("/chat/completions", "/audio/transcriptions")}`,
      {
        method: "POST",
        headers: {
          "api-key": process.env.AZURE_OPENAI_API_KEY!,
        },
        body: whisperFormData,
      },
    )

    if (!response.ok) {
      throw new Error(`Azure Whisper API error: ${response.statusText}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({
        text: result.text,
        confidence: 0.95, // Azure doesn't return confidence, using default
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Whisper API error:", error)
    return new Response(JSON.stringify({ error: "Failed to transcribe audio" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
