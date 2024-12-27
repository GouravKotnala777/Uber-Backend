import express from "express";
import { login, myProfile, register, updateMyProfile } from "../controllers/userController.js";
import { isUserAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(isUserAuthenticated, myProfile);
userRouter.route("/update").post(isUserAuthenticated, updateMyProfile);

export default userRouter;