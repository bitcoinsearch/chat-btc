import { client } from "@/config/elastic-search";
import ERROR_MESSAGES, { getAllErrorMessages } from "@/config/error-config";
import { SupaBaseDatabase } from "@/database/database";
import keyword_extractor from "keyword-extractor";
import { Result } from "./openaiChat";
import { createReadableStream } from "./stream";

export async function extractKeywords(inputSentence: string) {
  try {
    const extraction_result: string[] = keyword_extractor.extract(
      inputSentence,
      {
        language: "english",
        remove_digits: false,
        return_changed_case: false,
        remove_duplicates: true,
        return_chained_words: true,
      }
    );
    const spaceSeparatedString: string = extraction_result.join(" ");
    return spaceSeparatedString;
  } catch (error) {
    return inputSentence;
  }
};

export async function getSearchResults(
  query: string,
  author?: string
) {
  try {
    const response = await client.search({
      index: process.env.ES_INDEX,

      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                },
              },
            ],
            must_not: [
              {
                match: {
                  type: "question",
                },
              },
            ],
            ...((author && author.length > 0
              ? {
                  filter: {
                    bool: {
                      must: [
                        {
                          match_phrase: {
                            authors: {
                              query: author,
                            },
                          },
                        },
                      ],
                    },
                  },
                }
              : {}) as any),
          },
        },
      },
    });
    return response.hits.hits as Result[];
  } catch (error) {
    return null;
  }
}

export async function extractESresults(
  Keywords: string,
  question: string,
  author?: string
) {
  let searchResults = await getSearchResults(Keywords, author);

  if (!searchResults || searchResults.length === 0) {
    searchResults = await getSearchResults(question, author);
  }

  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  return searchResults;
}

export const fetchESResult = async (query: string, author?: string) : Promise<Result[] | null> => {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        question: query,
        author: author,
      },
    }),
  });
  
  if (!response.ok) {
    return null
  }

  return await response.json();
};

export const fetchResult = async (query: string, author?: string) => {
  const extractedKeywords = await extractKeywords(query);
  const keywords = extractedKeywords === "" ? query : extractedKeywords;

  const searchResults = await extractESresults(keywords, query, author);
  
  if (!searchResults) {
    return null
  }

  return searchResults
};

export const legacyFetchResult = async (query: string, author?: string) => {
  const searchResults = await fetchESResult(query, author); // Remove ": Response" type here
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: [
        {
          question: query,
          searchResults: searchResults,
        },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.UNKNOWN);
  }
  return response; // Add this line to correctly access the output
};

export const getCachedAnswer = async (question: string, author?: string) => {
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
