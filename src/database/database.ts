import { DATABASE_VALIDITY_IN_DAYS } from "@/config/constants";
import ERROR_MESSAGES, { getAllErrorMessages } from "@/config/error-config";
import { FeedbackPayload, Payload } from "@/types";
import { separateLinksFromApiMessage } from "@/utils/links";
import { createClient } from "@supabase/supabase-js";
import {ENV} from "@/config/env"

// Initialize Supabase client
const {SUPABASE_URL, SUPABASE_ANON_KEY, DB_NAME} = ENV

let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Example usage: Fetch all rows from a table named "tasks"
export class SupaBaseDatabase {
  static getInstance() {
    return new SupaBaseDatabase();
  }

  async fetchData() {
    const { data, error } = await supabase.from(DB_NAME).select("*");

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      console.log("Fetched tasks:", data);
    }
  }
  async insertData(payload: Payload) {
    if (!payload.answer) return false;

    payload.question = payload.question.toLowerCase();
    if (payload.author_name) {
      payload.author_name = payload.author_name.toLowerCase();
    }
    const { data, error } = await supabase.from(DB_NAME).insert([payload]);
    if (error) {
      console.error("Error inserting Q&A:", error);
      return false
    } else {
      console.log("Q&A inserted.");
      return true
    }
  }
  async addFeedback(payload: FeedbackPayload) {
    const { answerQuality, feedbackId, rating, timestamp } = payload;
    const { data, error, status } = await supabase
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
    oneDayBefore.setDate(oneDayBefore.getDate() - DATABASE_VALIDITY_IN_DAYS);
    let query = supabase
      .from(DB_NAME)
      .select("answer, createdAt")
      .eq('question', question)
      .gte('createdAt', oneDayBefore.toISOString())
      .lt('createdAt', new Date().toISOString())
      .order('createdAt', { ascending: false});

      // If author exists, add .eq('author_name', author) to the query
      if(author){
          query = query.eq('author_name', author);
      }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching answer:", error);
      return null;
    } 
    return data
  }
}
