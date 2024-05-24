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
  // Determine the index based on whether coredev is the persona
  const index =
    author === "coredev" ? process.env.ES_INDEX_CORE : process.env.ES_INDEX;

  try {
    const response = await client.search({
      index: index,
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
          ...((author && author.length > 0 && author !== "coredev"
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
      _source: {
        excludes: ["summary_vector_embeddings"],
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
