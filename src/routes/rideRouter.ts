import express from "express";
import { isDriverAuthenticated, isUserAuthenticated } from "../middlewares/auth.js";
import { acceptRideRequest, cancelRide, createRideRequest, endRide, getFareOfTrip, startRide } from "../controllers/rideController.js";

const rideRouter = express.Router();

rideRouter.route("/create").post(isUserAuthenticated, createRideRequest);
rideRouter.route("/accept").post(isDriverAuthenticated, acceptRideRequest);
rideRouter.route("/get-fare").post(isUserAuthenticated, getFareOfTrip);
rideRouter.route("/start").post(isDriverAuthenticated, startRide);
rideRouter.route("/end").post(isDriverAuthenticated, endRide);
rideRouter.route("/cancel").post(isDriverAuthenticated, cancelRide);

export default rideRouter;