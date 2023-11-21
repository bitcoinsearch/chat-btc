import { SupaBaseDatabase } from "@/database/database";
import { Payload } from "@/types";
import { formatDate } from "./date";

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