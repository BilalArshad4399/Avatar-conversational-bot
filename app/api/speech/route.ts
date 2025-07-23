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

    // Convert File to ArrayBuffer for Azure Speech Services
    const audioBuffer = await audioFile.arrayBuffer()
    const audioData = new Uint8Array(audioBuffer)

    console.log("Processing audio with Azure Speech Services:", audioData.length, "bytes")

    // Azure Speech Services REST API endpoint
    const speechEndpoint = `${process.env.AZURE_SPEECH_ENDPOINT}/speechtotext/v3.1/transcriptions:transcribe`

    const response = await fetch(speechEndpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY!,
        "Content-Type": "audio/wav",
        Accept: "application/json",
      },
      body: audioData,
    })

    console.log("Azure Speech response status:", response.status)
    console.log("Azure Speech response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Azure Speech API error:", errorText)

      // Try alternative endpoint format
      const altEndpoint = `${process.env.AZURE_SPEECH_ENDPOINT}/speechtotext/recognition/conversation/cognitiveservices/v1?language=en-US`

      const altResponse = await fetch(altEndpoint, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY!,
          "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
          Accept: "application/json",
        },
        body: audioData,
      })

      if (!altResponse.ok) {
        const altErrorText = await altResponse.text()
        console.error("Alternative Azure Speech API error:", altErrorText)
        throw new Error(`Azure Speech API error: ${response.status} - ${errorText}`)
      }

      const altResult = await altResponse.json()
      console.log("Alternative Azure Speech result:", altResult)

      return new Response(
        JSON.stringify({
          text: altResult.DisplayText || altResult.RecognitionStatus === "Success" ? altResult.DisplayText : "",
          confidence: altResult.Confidence || 0.9,
        }),
        { headers: { "Content-Type": "application/json" } },
      )
    }

    const result = await response.json()
    console.log("Azure Speech result:", result)

    // Handle different response formats from Azure Speech Services
    let transcribedText = ""
    let confidence = 0.9

    if (result.combinedRecognizedPhrases && result.combinedRecognizedPhrases.length > 0) {
      transcribedText = result.combinedRecognizedPhrases[0].display
      confidence = result.combinedRecognizedPhrases[0].confidence || 0.9
    } else if (result.DisplayText) {
      transcribedText = result.DisplayText
      confidence = result.Confidence || 0.9
    } else if (result.RecognitionStatus === "Success" && result.DisplayText) {
      transcribedText = result.DisplayText
      confidence = result.Confidence || 0.9
    }

    return new Response(
      JSON.stringify({
        text: transcribedText,
        confidence: confidence,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Azure Speech API error:", error)

    // Fallback response to prevent breaking the flow
    return new Response(
      JSON.stringify({
        error: "Azure Speech failed, using Web Speech API fallback",
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
