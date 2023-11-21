import { TYPING_DELAY_IN_MILLISECONDS } from "@/config/ui-config";

export function createReadableStream(text: string, signal?: AbortSignal) {
  const encoder = new TextEncoder();
  let interval: NodeJS.Timer

  // if (signal) {
  //   signal.addEventListener("abort", () => {
  //     clearInterval(interval);
  //     if (!readable.locked) {
  //       readable.cancel("Aborted");
  //     }
  //   })
  // }

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