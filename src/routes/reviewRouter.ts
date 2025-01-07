import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { createReview, findDriverAllReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.route("/my").get(isUserAuthenticated, findDriverAllReviews);
reviewRouter.route("/create").post(isUserAuthenticated, createReview);

export default reviewRouter;