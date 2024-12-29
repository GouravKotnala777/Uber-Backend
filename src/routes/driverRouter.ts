import express from "express";
import { isDriverAuthenticated, isUserAuthenticated } from "../middlewares/auth.js";
import { driverLogin, driverProfile, driverRegister, removeDriverProfileImage, updateMyDrivingProfile, uploadDriverProfileImage } from "../controllers/driverController.js";
import upload from "../middlewares/multer.js";
//import { allNearbyDrivers, driverLogin, driverProfile, driverRegister } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.route("/register").post(driverRegister);
driverRouter.route("/login").post(driverLogin);
driverRouter.route("/me").get(isDriverAuthenticated, driverProfile);
driverRouter.route("/update").post(isDriverAuthenticated, updateMyDrivingProfile);
driverRouter.route("/upload-image").post(isDriverAuthenticated, upload.single("image"), uploadDriverProfileImage);
driverRouter.route("/remove-image").post(isDriverAuthenticated, removeDriverProfileImage);
//driverRouter.route("/nearbyDrivers").get(isUserAuthenticated, allNearbyDrivers);

export default driverRouter;