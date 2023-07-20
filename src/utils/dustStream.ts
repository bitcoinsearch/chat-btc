import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export async function DustStream(inputs: ({question: string}[])) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const response = await fetch(process.env.BASE_URL ?? "", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "specification_hash": process.env.SPEC_HASH,
      "config": {
        "KEYWORD_EXTRACT": {
          "provider_id":"openai",
          "model_id":"gpt-3.5-turbo",
          "use_cache":true
        },
        "ES_SEARCH": {
          "use_cache":true
        },
        "MODEL_ANSWER_WITH_REFS": {
          "provider_id":"openai",
          "model_id":"gpt-3.5-turbo",
          "use_cache":true,
          "use_stream": true,
        }
      },
      blocking: true,
      stream: true,
      inputs
    }),
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          let text = ""
          try {
            const jsonData = JSON.parse(data)
            if (jsonData?.type === "final") {
              controller.close();
              return;
            }
            if (jsonData.content?.block_name === "MODEL_ANSWER_WITH_REFS" && jsonData.type === "tokens") {
              text = jsonData.content?.tokens?.text ?? ""
            } else if (jsonData?.content?.block_name === "FINAL" && jsonData?.type === "block_execution") {
              text = jsonData.content?.execution?.[0]?.[0]?.value?.answer ?? "can't resolve"
            } else {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e)
          }
        }
      }
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    }
  })

  return stream;
}
