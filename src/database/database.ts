import { FeedbackPayload } from "@/types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import getConfig from "next/config";

// Access the environment variables
const { publicRuntimeConfig } = getConfig();
const SUPABASE_URL = publicRuntimeConfig.SUPABASE_URL;
const SUPABASE_ANON_KEY = publicRuntimeConfig.SUPABASE_ANON_KEY;
const DB_NAME = publicRuntimeConfig.DB_NAME;

export const isSupabaseInitialized = SUPABASE_URL !== undefined && SUPABASE_ANON_KEY !== undefined && SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";

let supabase: SupabaseClient | null;

if (SUPABASE_URL) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  supabase = null;
  console.error('SUPABASE_URL is not defined in .env file');
}

// Example usage: Fetch all rows from a table named "tasks"
export class SupaBaseDatabase {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  static getInstance(): SupaBaseDatabase {
    if (!supabase) {
      throw new Error('Supabase has not been initialized because SUPABASE_URL is not defined');
    }
    return new SupaBaseDatabase(supabase);
  }

  async fetchData() {
    const { data, error } = await this.client.from(DB_NAME).select("*");

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      console.log("Fetched tasks:", data);
    }
  }
  async insertData(payload: any) {
    if (!this.client) {
      throw new Error('Supabase client is not initialized');
    }

    payload.question = payload.question.toLowerCase();
    payload.author_name = payload.author_name.toLowerCase();

    const { data, error } = await this.client.from(DB_NAME).insert([payload]);

    if (error) {
      console.error("Error inserting Q&A:", error);
    } else {
      console.log("Q&A inserted.");
    }
  }
  async addFeedback(payload: FeedbackPayload) {
    const { answerQuality, feedbackId, rating, timestamp } = payload;
    const { data, error, status } = await this.client
      .from(DB_NAME)
      .update({
        answerQuality,
        rating,
        updatedAt: timestamp,
      })
      .eq("uniqueId", feedbackId);

    if (error) {
      console.error("Error inserting rating:", error);
    }
    if (data) {
      console.log("Q&A rating updated:", data);
    }
    return { data, error, status };
  }
  async getAnswerByQuestion(question: string, author?: string) {
    const oneDayBefore = new Date();
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    let query = this.client
      .from(DB_NAME)
      .select("answer, createdAt")
      .eq('question', question);

      // If author exists, add .eq('author_name', author) to the query
      if(author){
          query = query.eq('author_name', author);
      }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching answer:", error);
      return null;
    } else {
      // filter data where createdAt is one day before
      const filteredData = data.filter(d => new Date(d.createdAt) >= oneDayBefore);
      // order filtered data
      const orderedData = filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      // Here we return null if no data found or orderedData if found
      return orderedData.length > 0 ? orderedData : null;
    }
  }
}

export const getCachedAnswer = async (question: string, author?: string) => {
  question = question.toLowerCase();
  author = author?.toLocaleLowerCase();
  const answers = await SupaBaseDatabase.getInstance().getAnswerByQuestion(
    question,
    author
  );

  if (!answers || answers.length === 0) {
    console.error("Error fetching answer: No answers found.");
    return null;
  }

  // Use JavaScript .find() method to get first element where answer is not an empty string
  const nonEmptyAnswer = answers.find((item) => item.answer.trim() !== "");

  if (!nonEmptyAnswer) {
    console.error("Error fetching answer: No non-empty answers found.");
    return null;
  }

  // Return the nonEmptyAnswer directly as a string
  return createReadableStream(nonEmptyAnswer.answer);
};

export const addDocumentToSupabase = async (payload: any) => {
  await SupaBaseDatabase.getInstance().insertData(payload);
};

function createReadableStream(text: string) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return readable;
}

export const addFeedback = async (feedback: FeedbackPayload, feedbackId: string) => {
  const { status, error } = await SupaBaseDatabase.getInstance().addFeedback({
    ...feedback,
    feedbackId,
  });

  if (status >= 200 && status < 300 && !error) {
    console.log("Feedback sent successfully");
    return true;
  }
  return false;
};
