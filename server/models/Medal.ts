import mongoose from "mongoose";

const MedalSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true },
  place: { type: Number, required: true }, // 1, 2, 3
  roomId: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Medal", MedalSchema);
