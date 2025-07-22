import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connection.on("connected", () => {});
    await mongoose.connect(`${process.env.MONGODB_URI}`);
  } catch {
    process.exit(1);
  }
};

export default connectDB;
