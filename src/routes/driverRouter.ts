import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { driverLogin, driverProfile, driverRegister } from "../controllers/driverController.js";
//import { allNearbyDrivers, driverLogin, driverProfile, driverRegister } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.route("/register").post(isUserAuthenticated, driverRegister);
driverRouter.route("/login").post(isUserAuthenticated, driverLogin);
driverRouter.route("/me").get(isUserAuthenticated, driverProfile);
//driverRouter.route("/nearbyDrivers").get(isUserAuthenticated, allNearbyDrivers);

export default driverRouter;