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
  searchEmailsAutocomplete
} from "../controllers/friendRequestController";

const friendRequestRouter = express.Router();

friendRequestRouter.get("/search", searchUser);
friendRequestRouter.get("/search-emails", searchEmailsAutocomplete); 
friendRequestRouter.get("/received", getReceivedRequests);
friendRequestRouter.get("/sent", getSentRequests);
friendRequestRouter.get("/friends", getFriendList)
friendRequestRouter.post("/send", sendRequest);
friendRequestRouter.post("/accept", acceptRequest);
friendRequestRouter.post("/decline", declineRequest);
friendRequestRouter.delete("/remove", removeFriend)

export default friendRequestRouter;
