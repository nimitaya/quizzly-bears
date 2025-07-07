import { User } from "./friendInterfaces";

export interface InviteRequest {
  _id: string;
  from: User;
  to: User;
  roomcode: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}
export interface InviteRequestResponse {
  message: string;
  inviteRequest: {
    _id: string;
    from: {
      _id: string;
      username?: string;
      email: string;
    };
    to: {
      _id: string;
      username?: string;
      email: string;
    };
    roomcode: string;
    status: string;
    createdAt: Date;
  };
}

export interface InviteRequestsResponse {
  inviteRequests: InviteRequest[];
}