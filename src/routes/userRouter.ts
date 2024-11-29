import express from "express";
import { register } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.route("/register").post(register);

export default userRouter;