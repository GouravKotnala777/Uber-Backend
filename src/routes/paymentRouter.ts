import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { createPayment } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.route("/create").post(isUserAuthenticated, createPayment);

export default paymentRouter;