import express from "express";
import { isDriverAuthenticated, isUserAuthenticated } from "../middlewares/auth.js";
import { createChat } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.route("/user/message/create").post(isUserAuthenticated, createChat);
chatRouter.route("/driver/message/create").post(isDriverAuthenticated, createChat);

export default chatRouter;