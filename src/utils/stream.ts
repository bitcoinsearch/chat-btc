import { TYPING_DELAY_IN_MILLISECONDS, TYPING_CHUNK_SIZE } from "@/config/ui-config";

export function createReadableStream(text: string, signal?: AbortSignal) {
  const encoder = new TextEncoder();
  let interval: NodeJS.Timer

  const readable = new ReadableStream({
    start(controller) {
      let textLength = text.length
      let currentCharIndex = 0
      interval = setInterval(() => {
        if (signal?.aborted) {
          controller.error(signal.reason)
          return
        }
        if (currentCharIndex < textLength) {
          const chunk = text.slice(currentCharIndex, currentCharIndex + TYPING_CHUNK_SIZE)
          controller.enqueue(encoder.encode(chunk))
          currentCharIndex += TYPING_CHUNK_SIZE
        } else {
          clearInterval(interval)
          controller.close();
        }
      }, TYPING_DELAY_IN_MILLISECONDS)
    },
  }) as ReadableStream<Uint8Array>;
  return readable;
}