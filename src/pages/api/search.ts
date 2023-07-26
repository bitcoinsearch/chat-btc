import { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@elastic/elasticsearch";
import keyword_extractor from "keyword-extractor";

const extractKeywords = async (inputSentence: string): Promise<string> => {
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

const client = new Client({
    cloud: {
      id: process.env.ES_CLOUD_ID as string
    },
    auth: {
      apiKey: process.env.ES_AUTHORIZATION_TOKEN as string
    }
});

async function extractESresults(
  Keywords: string,
  question: string,
  author?: string
): Promise<any[] | undefined> {
  let searchResults = await getSearchResults(Keywords, author);

  if (!searchResults || searchResults.length === 0) {
    searchResults = await getSearchResults(question, author);
  }

  if (!searchResults || searchResults.length === 0) {
    return undefined;
  }

  // If searchResults are found, return them
  return searchResults;
}

async function getSearchResults(
  query: string,
  author?: string
): Promise<any | undefined> {
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
                              analyzer: "analyzer_search", // Use the analyzer with synonym filter for filtering
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
    return response.hits.hits;
  } catch (error) {
    return undefined;
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { inputs } = req.body;
    const { question: query, author } = inputs;

    const extractedKeywords = await extractKeywords(query);
    const keywords = extractedKeywords === "" ? query : extractedKeywords;

    const searchResults = await extractESresults(keywords, query, author);
    
    if (!searchResults) {
      res.status(200).json({ message: "I am not able to find an answer to this question. So please rephrase your question and ask again." });
      return;
    }

    res.status(200).json(searchResults);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
