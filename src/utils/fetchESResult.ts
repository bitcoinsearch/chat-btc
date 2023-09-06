import { client } from "@/config/elastic-search";
import keyword_extractor from "keyword-extractor";
import { Result } from "./openaiChat";

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
}

export async function getSearchResults(query: string, author?: string) {
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
