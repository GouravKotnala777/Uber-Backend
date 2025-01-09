import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import Review, { ReviewTypes, ReviewTypesPopulated } from "../models/reviewModel.js";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { Document, Schema } from "mongoose";


export const findDriverAllReviews = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {driverID, rideID}:{driverID?:string; rideID?:string;} = req.query;

        if (!driverID || !rideID) return next(new ErrorHandler("Wrong driverID or rideID", 400));

        const driverAllReviews = await Review.find({
            driverID
        }).populate({model:"User", path:"passengerID", select:"image"}) as ReviewTypesPopulated[];

        const isReviewExist = driverAllReviews.find((review) => review.rideID?.toString() === rideID);        

        res.status(200).json({success:true, message:"Driver all reviews", jsonData:{driverAllReviews, isReviewExist}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const createReview = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {driverID, rideID, rating, comment}:{driverID:string; rideID:string; rating:number; comment?:string;} = req.body;
        const userID = (req as AuthenticatedRequest).user._id;

        if (!driverID || !rideID || !rating) return next(new ErrorHandler("All fields are required", 400));

        const isReviewExists = await Review.findOne({
            passengerID:userID, rideID, driverID
        });

        let review:Document<unknown, {}, ReviewTypes|ReviewTypesPopulated> & ReviewTypes|ReviewTypesPopulated & Required<{
            _id: Schema.Types.ObjectId;
        }>|null = null;
        let message:string = "";


        if (isReviewExists) {
            if (comment) isReviewExists.comment = comment;
            isReviewExists.rating = rating;

            review = await isReviewExists.save();
            message = "Review updated";
        }
        else{
            review = await Review.create({
                passengerID:userID, driverID, rideID, rating, comment
            });
            if (!review) return next(new ErrorHandler("Internal server error", 500));
            message = "Review created";
        }

        res.status(200).json({success:true, message, jsonData:review});
    } catch (error) {
        console.log(error);
        next(error);
    }
};