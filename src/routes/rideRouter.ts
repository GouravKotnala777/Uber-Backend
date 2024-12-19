import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { acceptRideRequest, createRideRequest, getFareOfTrip, startRide } from "../controllers/rideController.js";

const rideRouter = express.Router();

rideRouter.route("/create").post(isUserAuthenticated, createRideRequest);
rideRouter.route("/accept").post(isUserAuthenticated, acceptRideRequest);
rideRouter.route("/get-fare").post(isUserAuthenticated, getFareOfTrip);
rideRouter.route("/start").post(isUserAuthenticated, startRide);

export default rideRouter;