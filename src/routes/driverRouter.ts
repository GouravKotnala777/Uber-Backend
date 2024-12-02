import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { driverRegister } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.route("/register").post(isUserAuthenticated, driverRegister);

export default driverRouter;