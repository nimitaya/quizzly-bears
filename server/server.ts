import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/connectDB";
import clerkWebhookRouter from "./routes/ClerkWebhook";
import friendRequestRouter from "./routes/friendRequestRoutes";

const app = express();
const port = process.env.PORTNUMMER || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/clerk-webhook", cors());
app.use("/api", clerkWebhookRouter);
app.use("/friends-requests", friendRequestRouter)
app.get("/", (req, res) => {
  res.send("API is running...");
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log("Server läuft auf: ", port);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};
startServer();
