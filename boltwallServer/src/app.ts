import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { boltwall } from "boltwall";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  return res.json({
    message: "Home route comes before boltwall and so is unprotected.",
  });
});

app.use(boltwall());

// this will require payment and proper lsat to access
app.get("/protected", (_req, res) =>
  res.json({
    message:
      "Protected route! This message will only be returned if an invoice has been paid",
  })
);

export default app;
