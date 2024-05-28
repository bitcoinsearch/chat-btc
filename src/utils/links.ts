import { messageIsErrorMessage } from "./error";

const linksRegex = /(^\[\d+\]:\s.*)/gm;
const questionRegex = /--\{\{([^}]+)\}\}--/g;

export const separateLinksFromApiMessage = (message: string) => {

  const chunks = message.trim()?.split(linksRegex).filter((value) => value.trim().length > 1)
  const links = chunks.slice(1)
  const body_and_questions = chunks[0] ?? ""
  const body_and_questions_chunks = body_and_questions?.trim()?.split(questionRegex).filter((value) => value.trim().length > 1)
  const body = body_and_questions_chunks[0]
  const questions = body_and_questions_chunks.slice(1).map(question => question.trim()) ?? []

  const messageQuestions = questions;
  const messageLinks = links;
  const isErrorMessage = messageIsErrorMessage(body ?? "")

  return { messageBody: body, messageLinks, messageQuestions, isErrorMessage };
};
