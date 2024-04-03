/** @type {import('next').NextConfig} */
const { withAxiom } = require('next-axiom');
require('dotenv').config();

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withAxiom(nextConfig)
