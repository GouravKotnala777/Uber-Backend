import mongoose from "mongoose";
import Ride, { RideStatusTypes } from "../../models/rideModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";
import { findAllDrivers } from "./driverModelServices.js";

// Create new ride
export const createRide = async({
    driverID,
    passengerID,
    distance,
    pickupLocation,
    dropoffLocation,
    status
}:{
    driverID:mongoose.Schema.Types.ObjectId;
    passengerID:mongoose.Schema.Types.ObjectId;
    distance:string;
    pickupLocation:string;
    dropoffLocation:string;
    status:RideStatusTypes;
}) => {

    if (!driverID || !passengerID || !distance || !pickupLocation || !dropoffLocation || !status) throw new ErrorHandler("All fields are required", 400);

    const newRide = await Ride.create({
        driverID,
        passengerID,
        distance,
        pickupLocation,
        dropoffLocation,
        status
    });

    if (!newRide) throw new ErrorHandler("Internal server error", 500);

    return newRide;
};
// find ride by id and update
export const findByIdAndUpdateRide = async({
    rideID,
    distance,
    pickupLocation,
    dropoffLocation,
    status
}:{
    rideID:mongoose.Schema.Types.ObjectId;
    distance?:string;
    pickupLocation?:string;
    dropoffLocation?:string;
    status?:RideStatusTypes;
}) => {
    const updateRide = await Ride.findByIdAndUpdate(rideID, {
        ...(distance&&{distance}),
        ...(pickupLocation&&{pickupLocation}),
        ...(dropoffLocation&&{dropoffLocation}),
        ...(status&&{status})
    });
    return updateRide;
};