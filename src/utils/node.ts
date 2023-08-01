import axios from "axios";
import https from "https";

import { ENV } from "@/config/env";

const LND_NODE = axios.create({
  baseURL: ENV.LND_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  headers: { "Grpc-Metadata-macaroon": ENV.MACAROON },
});

export default LND_NODE;
