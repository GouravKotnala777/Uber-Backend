import express from "express";
import { isDriverAuthenticated, isUserAuthenticated } from "../middlewares/auth.js";
import { driverLogin, driverProfile, driverRegister } from "../controllers/driverController.js";
//import { allNearbyDrivers, driverLogin, driverProfile, driverRegister } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.route("/register").post(driverRegister);
driverRouter.route("/login").post(driverLogin);
driverRouter.route("/me").get(isDriverAuthenticated, driverProfile);
//driverRouter.route("/nearbyDrivers").get(isUserAuthenticated, allNearbyDrivers);

export default driverRouter;