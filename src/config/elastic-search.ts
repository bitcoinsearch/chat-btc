import { Client } from "@elastic/elasticsearch";

const client = new Client({
  cloud: {
    id: process.env.ES_CLOUD_ID as string,
  },
  auth: {
    username: process.env.ES_USERNAME as string,
    password: process.env.ES_PASSWORD as string,
  },
});

export { client }
