/** @type {import('next').NextConfig} */
const { withAxiom } = require('next-axiom');
require('dotenv').config();

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withAxiom(nextConfig)
module.exports = {
  env: {
    SUPABASE_URL:process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    DB_NAME:process.env.DB_NAME,
    SPEC_HASH:process.env.SPEC_HASH,
    ES_AUTHORIZATION_TOKEN:process.env.ES_AUTHORIZATION_TOKEN,
    OPENAI_API_KEY:process.env.OPENAI_API_KEY,
    ES_CLOUD_ID:process.env.ES_CLOUD_ID,
    ES_INDEX:process.env.ES_INDEX,
  },
  publicRuntimeConfig: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    DB_NAME: process.env.DB_NAME,
    ES_AUTHORIZATION_TOKEN:process.env.ES_AUTHORIZATION_TOKEN,
    OPENAI_API_KEY:process.env.OPENAI_API_KEY,
    ES_CLOUD_ID:process.env.ES_CLOUD_ID,
    ES_INDEX:process.env.ES_INDEX,
  },
}
