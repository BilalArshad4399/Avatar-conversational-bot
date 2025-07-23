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

    // Construct the correct Azure OpenAI Whisper endpoint
    const baseEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.split("/chat/completions")[0]
    const whisperEndpoint = `${baseEndpoint}/audio/transcriptions?api-version=2024-02-01`

    console.log("Using Whisper endpoint:", whisperEndpoint)

    // Convert File to FormData for Azure OpenAI Whisper
    const whisperFormData = new FormData()
    whisperFormData.append("file", audioFile)
    whisperFormData.append("model", "whisper-1")
    whisperFormData.append("response_format", "json")

    const response = await fetch(whisperEndpoint, {
      method: "POST",
      headers: {
        "api-key": process.env.AZURE_OPENAI_API_KEY!,
      },
      body: whisperFormData,
    })

    console.log("Whisper response status:", response.status)
    console.log("Whisper response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Azure Whisper API error:", errorText)
      throw new Error(`Azure Whisper API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Whisper result:", result)

    return new Response(
      JSON.stringify({
        text: result.text || "",
        confidence: 0.95, // Azure doesn't return confidence, using default
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Whisper API error:", error)

    // Fallback to Web Speech API result if Azure fails
    return new Response(
      JSON.stringify({
        error: "Azure Whisper failed, using Web Speech API fallback",
        text: "",
        confidence: 0.0,
      }),
      {
        status: 200, // Return 200 to prevent breaking the flow
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
