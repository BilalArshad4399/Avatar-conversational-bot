// Web Speech API type definitions for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    serviceURI: string
    grammars: SpeechGrammarList
    start(): void
    stop(): void
    abort(): void
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
    readonly interpretation: any
    readonly emma: Document | null
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error:
      | "no-speech"
      | "aborted"
      | "audio-capture"
      | "network"
      | "not-allowed"
      | "service-not-allowed"
      | "bad-grammar"
      | "language-not-supported"
    readonly message: string
  }

  interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
  }

  interface SpeechGrammarList {
    readonly length: number
    item(index: number): SpeechGrammar
    [index: number]: SpeechGrammar
    addFromURI(src: string, weight?: number): void
    addFromString(string: string, weight?: number): void
  }

  interface SpeechGrammar {
    src: string
    weight: number
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition
    new (): SpeechRecognition
  }

  var webkitSpeechRecognition: {
    prototype: SpeechRecognition
    new (): SpeechRecognition
  }
}

export {}
