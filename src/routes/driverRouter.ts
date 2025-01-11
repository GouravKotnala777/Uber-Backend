import express from "express";
import { isDriverAuthenticated, isUserAuthenticated } from "../middlewares/auth.js";
import { driverLogin, driverLogout, driverProfile, driverRegister, getAllDrivers, removeDriverProfileImage, updateMyDrivingProfile, uploadDriverProfileImage, verifyDriver } from "../controllers/driverController.js";
import upload from "../middlewares/multer.js";
//import { allNearbyDrivers, driverLogin, driverProfile, driverRegister } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.route("/all").get(getAllDrivers);
driverRouter.route("/register").post(isUserAuthenticated, driverRegister);
driverRouter.route("/login").post(driverLogin);
driverRouter.route("/verify").post(verifyDriver);
driverRouter.route("/me").get(isDriverAuthenticated, driverProfile);
driverRouter.route("/update").post(isDriverAuthenticated, updateMyDrivingProfile);
driverRouter.route("/upload-image").post(isDriverAuthenticated, upload.single("image"), uploadDriverProfileImage);
driverRouter.route("/remove-image").post(isDriverAuthenticated, removeDriverProfileImage);
//driverRouter.route("/nearbyDrivers").get(isUserAuthenticated, allNearbyDrivers);
driverRouter.route("/logout").post(isDriverAuthenticated, driverLogout);

export default driverRouter;