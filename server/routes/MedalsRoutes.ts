import express from "express";
import { sendMedal } from "../controllers/medalController";

const router = express.Router();

router.post("/send", sendMedal);

export default router;
