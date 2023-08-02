const ERROR_MESSAGES = {
  "NO_ANSWER": "I am not able to find an answer to this question. So please rephrase your question and ask again.",
  "NO_RESPONSE": "I am not able to provide you with a proper answer to the question, but you can follow up with the links provided to find the answer on your own. Sorry for the inconvenience.",
  "NO_ANSWER_WITH_LINKS": "I cannot find the proper answer to your question. Although I'm not entirely certain, further research on the topic may provide you with more accurate information.",
  "OVERLOAD": "The system is overloaded with requests, can you please ask your question in 5 seconds again? Thank you!",
  "UNKNOWN": "Something went wrong. Try again later",
}

export const getAllErrorMessages = () => {
  return Object.values(ERROR_MESSAGES)
}


export default ERROR_MESSAGES;