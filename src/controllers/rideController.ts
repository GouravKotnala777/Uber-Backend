import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Ride, { RideStatusTypes } from "../models/rideModel.js";
import { findByIdAndUpdateRide } from "../config/services/rideModelServices.js";
import { ErrorHandler } from "../utils/utilityClasses.js";

// Create new ride request
export const createRideRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            driverID, passengerID, distance, pickupLocation, dropoffLocation, status
        }:{
            driverID:mongoose.Schema.Types.ObjectId;
            passengerID:mongoose.Schema.Types.ObjectId;
            distance:string;
            pickupLocation:string;
            dropoffLocation:string;
            status:RideStatusTypes;
        } = req.body;

        const newRide = await Ride.create({
            driverID, passengerID, distance, pickupLocation, dropoffLocation, status
        });

        res.status(200).json({success:true, message:"Requested for cab", jsonData:newRide});
    } catch (error) {
        next(error);
    }
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
