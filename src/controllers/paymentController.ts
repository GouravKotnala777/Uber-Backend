import { NextFunction, Request, Response } from "express";
import Payment, { PaymentMethodTypes, PaymentStatusTypes } from "../models/paymentModel.js";
import mongoose from "mongoose";
import { ErrorHandler } from "../utils/utilityClasses.js";
import Ride from "../models/rideModel.js";


export const createPayment = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {rideID, amount, paymentMethod, paymentStatus}:{rideID:mongoose.Schema.Types.ObjectId; amount:number; paymentMethod:PaymentMethodTypes; paymentStatus:PaymentStatusTypes;} = req.body;

        console.log({rideID, amount, paymentMethod, paymentStatus});

        if (!rideID || !amount || !paymentMethod || !paymentStatus) return next(new ErrorHandler("All fields are required", 400));

        
        const newPayment = await Payment.create({
            rideID, amount, paymentMethod, paymentStatus
        });
        
        const updatedRide = await Ride.findByIdAndUpdate(rideID, {
            paymentID:newPayment._id
        }, {new:true});

        res.status(200).json({success:true, message:"Payment done", jsonData:newPayment});
    } catch (error) {
        console.log(error);
        next(error);        
    }
}