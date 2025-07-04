export interface User {
  _id: string;
  username?: string;
  email: string;
  bearPawIcon: boolean;
  points?: {
    totalPoints: number;
    weeklyPoints: number;
    correctAnswers: number;
    totalAnswers: number;
  };
}

export interface FriendRequest {
  _id: string;
  from: User;
  to: User;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

export interface SearchUserResponse {
  user: {
    _id: string;
    username?: string;
    email: string;
    bearPawIcon: boolean;
  };
}

export interface FriendRequestResponse {
  message: string;
  friendRequest: {
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
    status: string;
    createdAt: Date;
  };
}

export interface FriendRequestsResponse {
  friendRequests: FriendRequest[];
}

export interface FriendsResponse {
  friends: User[];
}

export interface FriendsState {
  friendList: FriendsResponse,
    receivedFriendRequests: FriendRequestsResponse,
    sentFriendRequests: FriendRequestsResponse,
}

export interface FriendItemProps {
  friend: User;
  onPressOne: () => void;
  onPressTwo: () => void;
  friendStatus: FriendStatus;
}

export type FriendStatus = "request" | "outstanding" | "friend";