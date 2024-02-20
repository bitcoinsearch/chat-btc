import ERROR_MESSAGES from "./error-config";

export const COMPLETION_URL = "https://api.openai.com/v1/chat/completions"

export const OPENAI_EXTRACTOR_MODEL = "gpt-3.5-turbo"

export const extractorSystemPrompt = `
You are a helpful assistant. You are given a list of user questions, the questions serve as context. Giving priority to ONLY the LAST QUESTION and the context from any relevant previous questions, what are the most relevant keywords that can be used in a search engine to find an answer to the last question. Return the minimum amount of relevant keywords in a json object: {keywords: 'keyword1, keyword2, ...'}
`;

export const guidelines = {
  BASE_INSTRUCTION:
    "You are an AI assistant providing helpful answers. You are given the following extracted parts of a long document called CONTEXT BLOCK and a conversation. Provide a conversational detailed answer in the same writing style as based on the context provided. DO NOT include any external references or links in the answers.",
  NO_ANSWER: `If you are absolutely certain that the answer cannot be found in the context below, just say this phrase '${ERROR_MESSAGES.NO_ANSWER_WITH_LINKS}' EXACTLY. Don't try to make up an answer.`,
  UNRELATED_QUESTION: `If the question is not related to the context, say this phrase EXACTLY '${ERROR_MESSAGES.NO_ANSWER}'`,
  LINKING: `DO NOT explicity mention the existence of the context provided, however, references can to be made to the links provided in the context e.g '[0]'`,
  FOLLOW_UP_QUESTIONS: `In addition, generate four follow up questions related to the answer generated. Each question should be in this format -{QUESTION_INDEX_HERE}-{{QUESTION_HERE}} and each question should be seperated by a new line. DO NOT ADD AN INTRODUCTORY TEXT TO THE FOLLOW UP QUESTIONS`,
};
