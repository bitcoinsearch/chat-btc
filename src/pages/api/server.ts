import { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@elastic/elasticsearch";
import keyword_extractor from "keyword-extractor";
import { SupaBaseDatabase } from "@/database/database";
import { createReadableStream } from "@/utils/stream";
import { fetchESResult, fetchResult } from "@/utils/fetchESResult";
import ERROR_MESSAGES, { getAllErrorMessages } from "@/config/error-config";
import { processInput } from "@/utils/openaiChat";

const getCachedAnswer = async (question: string, author?: string) => {
  question = question.toLowerCase();
  author = author?.toLocaleLowerCase();
  const errorMessages = getAllErrorMessages()
  try {
    const answers = await SupaBaseDatabase.getInstance().getAnswerByQuestion(
      question,
      author
    );

    if (!answers || answers.length === 0) {
      console.error("Error fetching answer: No answers found.");
      return null;
    }

    const nonEmptyAnswer = answers.find((item) => Boolean(item.answer && item.answer?.trim() && !errorMessages.includes(item.answer)));

    if (!nonEmptyAnswer) {
      console.error("Error fetching answer: No non-empty answers found.");
      return null;
    }
    return createReadableStream(nonEmptyAnswer.answer);
  } catch (error) {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { inputs } = req.body;
    const { question: query, author } = inputs;

    const cachedAnswer = await getCachedAnswer(query, author);

    if (cachedAnswer) {
      return new Response(cachedAnswer)
    }

    const esResults = await fetchResult(query, author);

    if (!esResults || !esResults.length) {
      return new Response(ERROR_MESSAGES.NO_ANSWER)
    }
    
    try {
      const result = await processInput(esResults, query);
      return new Response(result);
    } catch (err) {
      return new Response(JSON.stringify({ error: ERROR_MESSAGES.UNKNOWN }), {
        status: 500,
      });
    }

  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
