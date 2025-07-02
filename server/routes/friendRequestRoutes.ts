import express from "express";
import {
  acceptRequest,
  declineRequest,
  getFriendList,
  getReceivedRequests,
  getSentRequests,
  removeFriend,
  searchUser,
  sendRequest,
} from "../controllers/friendRequestController";

const friendRequestRouter = express.Router();

friendRequestRouter.get("/search", searchUser);
friendRequestRouter.post("/send", sendRequest);
friendRequestRouter.get("/received", getReceivedRequests);
friendRequestRouter.get("/sent", getSentRequests);
friendRequestRouter.post("/accept", acceptRequest);
friendRequestRouter.post("/decline", declineRequest);
friendRequestRouter.get("/friends", getFriendList)
friendRequestRouter.delete("/remove", removeFriend)

export default friendRequestRouter;
