import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { allNearbyDrivers, driverLogin, driverProfile, driverRegister } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.route("/register").post(isUserAuthenticated, driverRegister);
driverRouter.route("/login").post(isUserAuthenticated, driverLogin);
driverRouter.route("/driverProfile").get(isUserAuthenticated, driverProfile);
driverRouter.route("/nearbyDrivers").get(isUserAuthenticated, allNearbyDrivers);

export default driverRouter;