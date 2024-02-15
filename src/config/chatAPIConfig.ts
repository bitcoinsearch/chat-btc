import ERROR_MESSAGES from "./error-config"

export const systemPrompt = `
  You are an AI assistant providing helpful answers.
  You are given the following extracted parts of a long document and a question.
  Provide a conversational detailed answer in the same writing style as based on the context provided.
  DO NOT include any external references or links in the answers.
  If you are absolutely certain that the answer cannot be found in the context below, just say '${ERROR_MESSAGES.NO_ANSWER_WITH_LINKS}' Don't try to make up an answer.
  If the question is not related to the context, politely respond that '${ERROR_MESSAGES.NO_ANSWER}'
`

export const guidelines = {
  // "BASE_INSTRUCTION": "You are an AI assistant providing helpful answers. You are given the following extracted parts of a long document and a question.",
  "BASE_INSTRUCTION": "You are an AI assistant providing helpful answers. You are given the following extracted parts of a long document and a question. Provide a conversational detailed answer in the same writing style as based on the context provided. DO NOT include any external references or links in the answers.",
  "NO_ANSWER": `If you are absolutely certain that the answer cannot be found in the context below, just say this phrase '${ERROR_MESSAGES.NO_ANSWER_WITH_LINKS}' EXACTLY. Don't try to make up an answer.`,
  "UNRELATED_QUESTION": `If the question is not related to the context, say this phrase EXACTLY '${ERROR_MESSAGES.NO_ANSWER}'`,
  "LINKING": `DO NOT mention the context provided, if references are to be made to the context, then refer with the links provided in the format [Link [link_index]](link_url)`,
  "FOLLOW_UP_QUESTIONS": `Generate four follow up questions related to the answer generated DO NOT REFERENCE LINKS. Each question should be in this format -{question_iterator}-{{QUESTION_HERE}} and each question should be seperated by a new line. DO NOT ADD AN INTRODUCTORY TEXT TO THE FOLLOW UP QUESTIONS`,
}
// export const guidelines = `
//   You are given the following extracted parts of a long document and a question.
//   Provide a conversational detailed answer in the same writing style as based on the context provided.
//   DO NOT include any external references or links in the answers.
//   If you are absolutely certain that the answer cannot be found in the context below,
//   just say '${ERROR_MESSAGES.NO_ANSWER_WITH_LINKS}
//   Don't try to make up an answer.
//   If the question is not related to the context, politely respond that '${ERROR_MESSAGES.NO_ANSWER}'
// `

const buildSystemMessage = (question: string, context: string) => {
  const {BASE_INSTRUCTION, NO_ANSWER, UNRELATED_QUESTION, FOLLOW_UP_QUESTIONS, LINKING} = guidelines
  return `${BASE_INSTRUCTION}\n${NO_ANSWER}\n${UNRELATED_QUESTION}\nQuestion: ${question}\n${context}\n${LINKING}\n${FOLLOW_UP_QUESTIONS}`
}

export const buildChatMessages = ({question, context, oldContext, messages}: {question: string, context: string, oldContext?: string, messages: any[]}) => {
  const systemMessage = buildSystemMessage(question, context)
  return [
    {
      role: "system",
      content: systemMessage,
    },
    ...messages,
  ]
}