import { FeedbackPayload } from "@/types";
import { createClient } from "@supabase/supabase-js";
import getConfig from "next/config";

// Access the environment variables
const { publicRuntimeConfig } = getConfig();
const SUPABASE_URL = publicRuntimeConfig.SUPABASE_URL;
const SUPABASE_ANON_KEY = publicRuntimeConfig.SUPABASE_ANON_KEY;
const DB_NAME = publicRuntimeConfig.DB_NAME;

// Initialize Supabase client
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
  async insertData(payload: any) {
    const { data, error } = await supabase.from(DB_NAME).insert([payload]);

    if (error) {
      console.error("Error inserting Q&A:", error);
    } else {
      console.log("Q&A inserted:", data);
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
}
