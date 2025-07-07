import express from "express";
import {
  searchUser,
  sendInvitationRequest,
  getReceivedInvitationRequests,
  getSentInvitationRequests,
  acceptInvitationRequest,
  declineInvitationRequest,
  getInvitationList,
  removeInvitation,
} from "../controllers/invitationsController";

const invitationsRouter = express.Router();
invitationsRouter.get("/search", searchUser)
invitationsRouter.post("/send", sendInvitationRequest)
invitationsRouter.get("/received", getReceivedInvitationRequests)
invitationsRouter.get("/sent", getSentInvitationRequests)
invitationsRouter.post("/accept", acceptInvitationRequest)
invitationsRouter.post("/decline", declineInvitationRequest)
invitationsRouter.get("/invitations", getInvitationList)
invitationsRouter.delete("/remove", removeInvitation)

export default invitationsRouter;
