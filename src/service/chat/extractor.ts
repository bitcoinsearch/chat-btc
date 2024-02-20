import { COMPLETION_URL, extractorSystemPrompt, OPENAI_EXTRACTOR_MODEL } from "@/config/chatAPI-config";
import { ChatHistory } from "@/types";

export const GPTKeywordExtractor = async (history: ChatHistory[]) => {
  try {
    const userQuestions = history
      .filter((message) => message.role === "user")
      .slice(-10);
      const messages = [
        {
          role: "system",
          content: extractorSystemPrompt,
        },
        ...userQuestions,
      ];

    const payload = {
      model: OPENAI_EXTRACTOR_MODEL,
      response_format: { "type": "json_object" },
      messages,
    };
    const response = await fetch(COMPLETION_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    const keywords = JSON.parse(body.choices[0]?.message.content).keywords
    if (Array.isArray(keywords)) {
      return keywords.map((keyword: string) => keyword.trim()).join(" ")
    }
    if (typeof keywords !== "string") {
      throw new Error("Parsed response is not a string")
    }
    
    return keywords.replaceAll(",", "")
  } catch (err) {
    console.log(err)
    return undefined
  }
};