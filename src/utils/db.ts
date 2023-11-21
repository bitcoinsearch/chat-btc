import { getAllErrorMessages } from "@/config/error-config";
import { SupaBaseDatabase } from "@/database/database";
import { Payload } from "@/types";
import { formatDate } from "./date";
import { separateLinksFromApiMessage } from "./links";
import { createReadableStream } from "./stream";

type manageSaveToDBProps = {
  id: string;
  query: string;
  answer: string;
  author?: string;
  wasAborted: boolean;
  errorMessages: string[];
}

export const manageSaveToDB = async ({
  id, query, answer, author, wasAborted, errorMessages
}: manageSaveToDBProps) => {
  const isValidAnswer = answer?.trim() && !errorMessages.includes(answer);
  const shouldSave = isValidAnswer && !wasAborted
  if (shouldSave) {
    try {
        let dateString = "04-10-2023"; // DD-MM-YY
        let timeString = "00:00:00";

        const dateTimeString =
          dateString.split("-").reverse().join("-") + "T" + timeString;
        const dateObject = new Date(dateTimeString);
        const formattedDateTime = formatDate(dateObject);

        const isValidAnswer = answer?.trim() && !errorMessages.includes(answer);

        let payload: Payload = {
          uniqueId: id,
          question: query,
          answer: isValidAnswer ? answer : null,
          author_name: author?.toLowerCase(),
          rating: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          releasedAt: formattedDateTime,
        };
        await SupaBaseDatabase.getInstance().insertData(payload);
    } catch (err: any) {
    }
  }
}

export const getCachedAnswer = async (question: string, signal: AbortSignal, author?: string) => {
  question = question.toLowerCase();
  author = author?.toLocaleLowerCase();
  const errorMessages = getAllErrorMessages();

  let foundAnswer = ""
  try {
    const answers = await SupaBaseDatabase.getInstance().getAnswerByQuestion(
      question,
      author
    );

    if (!answers || answers.length === 0) {
      console.error("Error fetching answer: No answers found.");
      return null;
    }

    const findNonEmptyAnswer = (item: {
      answer: string | null;
      createdAt: string;
    }) => {
      if (!item.answer || !item.answer?.trim()) {
        return false;
      }
      const messageBodyNoLinks = separateLinksFromApiMessage(
        item.answer
      ).messageBody;
      return !errorMessages.includes(messageBodyNoLinks);
    };
    const nonEmptyAnswer = answers.find((item) => findNonEmptyAnswer(item));

    if (!nonEmptyAnswer) {
      console.error("Error fetching answer: No non-empty answers found.");
      return null;
    }
    foundAnswer = nonEmptyAnswer.answer

  } catch (error) {
    return null;
  }
  return createReadableStream(foundAnswer, signal);
};