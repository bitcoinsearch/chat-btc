import ERROR_MESSAGES from "./error-config";

export const COMPLETION_URL = "https://api.openai.com/v1/chat/completions"

export const OPENAI_EXTRACTOR_MODEL = "gpt-3.5-turbo"

export const extractorSystemPrompt = `
You are a helpful assistant. You are given a list of user questions, the questions serve as context. Giving priority to ONLY the LAST QUESTION and the context from any relevant previous questions, what are the most relevant keywords that can be used in a search engine to find an answer to the last question. Return the minimum amount of relevant keywords in a json object: {keywords: 'keyword1, keyword2, ...'}
`;

export const guidelines = {
  BASE_INSTRUCTION:
    "You are an AI assistant providing helpful answers. You are given the following extracted parts of a long document called CONTEXT BLOCK and a conversation. Provide a conversational detailed answer in the same writing style as based on the context provided. DO NOT include any external references or links in the answers.",
  NO_ANSWER: `If you are absolutely certain that the answer cannot be found in the CONTEXT BLOCK, just say this phrase '${ERROR_MESSAGES.NO_ANSWER}' EXACTLY. DO NOT try to make up an answer that is not in the CONTEXT BLOCK.`,
  UNRELATED_QUESTION: `If the question is not related to the context, say this phrase EXACTLY '${ERROR_MESSAGES.NO_ANSWER}'`,
  LINKING: `DO NOT explicity mention the existence of the context provided, however, references can and should be made to the links provided in the context e.g '[0]'.`,
  FOLLOW_UP_QUESTIONS: 'If you have an answer, generate four relevant follow up questions, do not include introductory text about follow-up questions. Each question must be in this format: `--{{ what problems did segwit solve }}--` in a new line.',
  USED_SOURCES: `Lastly, list all sources relevant in generating the answer in a list in this format '__sources__: [LINK_INDICES_HERE]'`
};

export const CONTEXT_WINDOW_MESSAGES = 6

export const TOKEN_UPPER_LIMIT = 7000
