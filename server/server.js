import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/connectDB.js";

const app = express();
const port = process.env.PORTNUMMER || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: ["http://localhost:5173"] }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};
startServer();

app.listen(port, () => {
  console.log("Server läuft auf: ", port);
});
