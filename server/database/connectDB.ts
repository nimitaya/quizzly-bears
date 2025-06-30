import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connection.on("connected", () => {
      console.log("Database Connected...");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/quizzlybears`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
