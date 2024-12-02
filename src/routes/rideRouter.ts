import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { acceptRideRequest, createRideRequest } from "../controllers/rideController.js";

const rideRouter = express.Router();

rideRouter.route("/create").post(isUserAuthenticated, createRideRequest);
rideRouter.route("/accept").post(isUserAuthenticated, acceptRideRequest);

export default rideRouter;