import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { driverLogin, driverRegister } from "../controllers/driverController.js";

const driverRouter = express.Router();

driverRouter.route("/register").post(isUserAuthenticated, driverRegister);
driverRouter.route("/login").post(isUserAuthenticated, driverLogin);

export default driverRouter;