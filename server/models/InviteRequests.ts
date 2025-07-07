import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "./User";

export interface IInviteRequest extends Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  roomcode: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

export interface IInviteRequestPopulated extends Omit<IInviteRequest, 'from' | 'to'> {
  from: IUser;
  to: IUser;
}

const inviteRequestSchema = new Schema<IInviteRequest>({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roomcode: {type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const InviteRequest = mongoose.model<IInviteRequest>(
  "InviteRequest",
  inviteRequestSchema
);
