import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Ride, { RideStatusTypes } from "../models/rideModel.js";
import { createRide, findByIdAndUpdateRide } from "../config/services/rideModelServices.js";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { VehicleTypeTypes } from "../models/driverModel.js";
import crypto from "crypto";

// Create new ride request
export const createRideRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            passengerID, pickupLocation, dropoffLocation, vehicleType
        }:{
            passengerID:mongoose.Schema.Types.ObjectId;
            pickupLocation:string;
            dropoffLocation:string;
            vehicleType:VehicleTypeTypes;
        } = req.body;

        const newRide = await createRide({
            passengerID, pickupLocation, dropoffLocation, vehicleType
        });

        res.status(200).json({success:true, message:"Requested for cab", jsonData:newRide});
    } catch (error) {
        next(error);
    }
};
// Gernerate an OTP
export function getOTP(num:number){
    function generateOTP(num:number){
        const otp = crypto.randomInt(Math.pow(10, num-1), Math.pow(10, num)).toString();
        return otp;
    };
    return generateOTP(num);
};
// Accept ride request
export const acceptRideRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {rideID, status}:{rideID:mongoose.Schema.Types.ObjectId; status:RideStatusTypes;} = req.body;

        const acceptedRide = await findByIdAndUpdateRide({rideID, status});

        if (!acceptedRide) return next(new ErrorHandler("Internal server error", 500));

        res.status(200).json({success:true, message:"Ride accepted", jsonData:acceptedRide});
    } catch (error) {
        next(error);
    }
};
