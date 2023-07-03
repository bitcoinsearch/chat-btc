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
      id: process.env.ES_CLOUD_ID as string,
    },
    auth: {
      username: process.env.ES_USERNAME as string,
      password: process.env.ES_PASSWORD as string
    }
  })

async function extractESresults(
  Keywords: string,
  question: string
): Promise<any[] | undefined> {
  let searchResults = await getSearchResults(Keywords);

  if (!searchResults || searchResults.length === 0) {
    searchResults = await getSearchResults(question);
  }

  if (!searchResults || searchResults.length === 0) {
    return undefined;
  }

  // If searchResults are found, return them
  return searchResults;
}

async function getSearchResults(query: string): Promise<any | undefined> {
  try {
    const response = await client.search({
      index: process.env.ES_INDEX,
      body: {
        query: {
          multi_match: {
            query, // This will always be used to look for query keywords in the documents
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
    const { question: query} = inputs;

    const extractedKeywords = await extractKeywords(query);
    const keywords = extractedKeywords === "" ? query : extractedKeywords;

    const searchResults = await extractESresults(keywords, query);
    // const searchResults = await getSearchResults(query, author);
    if (!searchResults) {
      res.status(200).json({ message: "I am not able to find an answer to this question. So please rephrase your question and ask again." });
      return;
    }

    res.status(200).json(searchResults);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}