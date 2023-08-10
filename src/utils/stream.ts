import { TYPING_DELAY_IN_MILLISECONDS } from "@/config/ui-config";

export function createReadableStream(text: string) {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    start(controller) {
      let textLength = text.length
      let currentCharIndex = 0
      let interval = setInterval(() => {
        if (currentCharIndex < textLength) {
          controller.enqueue(encoder.encode(text[currentCharIndex]))
          currentCharIndex++
        } else {
          clearInterval(interval)
          controller.close();
        }
      }, TYPING_DELAY_IN_MILLISECONDS)
    },
  }) as ReadableStream<Uint8Array>;
  return readable;
}