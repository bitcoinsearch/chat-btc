import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 9000;

app.listen(PORT, (): void => {
  console.log(`Server Running here 👉 https://localhost:${PORT}`);
});
