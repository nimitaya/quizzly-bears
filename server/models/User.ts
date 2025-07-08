import mongoose, { Document, Schema, Types } from "mongoose";

// Category Stat Subschema
const categoryStatSchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
      enum: [
        "Science",
        "History",
        "Geography",
        "Sports",
        "Media",
        "Culture",
        "Daily Life",
      ],
    },
    correctAnswers: { type: Number, default: 0 },
    totalAnswers: { type: Number, default: 0 },
  },
  { _id: false }
);

// Push Token Subschema
const pushTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    deviceType: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "android",
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// TypeScript interfaces
export interface ICategoryStat {
  categoryName: string;
  correctAnswers: number;
  totalAnswers: number;
}

export interface IPushToken {
  token: string;
  deviceType: "web" | "android" | "ios";
  addedAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  clerkUserId: string;
  username: string;
  email: string;
  points: {
    totalPoints: number;
    correctAnswers: number;
    totalAnswers: number;
  };
  categoryStats: ICategoryStat[];
  friends: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  bearPawIcon: boolean;
  pushTokens: IPushToken[];
  isAdmin: boolean;
  settings: {
    language: string;
    sounds: boolean;
    music: boolean;
  };
  isOnline: boolean;
}

const DEFAULT_CATEGORIES = [
  "Science",
  "History",
  "Geography",
  "Sports",
  "Media",
  "Culture",
  "Daily Life",
];

const userSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    username: { type: String, index: true, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    points: {
      totalPoints: { type: Number, default: 0 },
      weeklyPoints: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      totalAnswers: { type: Number, default: 0 },
    },
    categoryStats: {
      type: [categoryStatSchema],
      default: () =>
        DEFAULT_CATEGORIES.map((category) => ({
          categoryName: category,
          correctAnswers: 0,
          totalAnswers: 0,
        })),
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "FriendRequest" }],
    medals: {
      gold: { type: Number, default: 0 },
      silver: { type: Number, default: 0 },
      bronze: { type: Number, default: 0 },
    },
    bearPawIcon: { type: Boolean, default: false },
    pushTokens: [pushTokenSchema],
    isAdmin: { type: Boolean, default: false },
    settings: {
      language: { type: String, default: "en" },
      sounds: { type: Boolean, default: true },
      music: { type: Boolean, default: true },
    },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
