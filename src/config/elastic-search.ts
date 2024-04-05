import { Client } from "@elastic/elasticsearch";
import { ENV } from "./env";

const client = new Client({
  cloud: {
    id: ENV.ES_CLOUD_ID as string,
  },
  auth: { apiKey: process.env.API_KEY as string },
});

export { client }
