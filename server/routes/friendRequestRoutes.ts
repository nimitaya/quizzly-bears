import express from "express";
import { searchUser } from "../controllers/friendRequestController";

const friendRequestRouter = express.Router()

friendRequestRouter.get("/search", searchUser)

export default friendRequestRouter