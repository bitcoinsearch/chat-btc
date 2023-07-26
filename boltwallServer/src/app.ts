import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { boltwall } from "boltwall";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(boltwall());

export default app;
