import express from "express";
import { login, logout, myProfile, register, removeProfileImage, updateMyProfile, uploadProfileImage, verifyUser } from "../controllers/userController.js";
import { isUserAuthenticated } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/verify").post(verifyUser);
userRouter.route("/me").get(isUserAuthenticated, myProfile);
userRouter.route("/update").post(isUserAuthenticated, updateMyProfile);
userRouter.route("/upload-image").post(isUserAuthenticated, upload.single("image"), uploadProfileImage);
userRouter.route("/remove-image").post(isUserAuthenticated, removeProfileImage);
userRouter.route("/logout").post(isUserAuthenticated, logout);

export default userRouter;