import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { LocationTypes, RideStatusTypes, RideTypesPopulated } from "../models/rideModel.js";
import { createRide, findByIdAndUpdateRide, findRideById, getFare } from "../config/services/rideModelServices.js";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { DriverTypesPopulated, VehicleTypeTypes } from "../models/driverModel.js";
import crypto from "crypto";
import { findDriverByID, getDriversWithinRadius } from "../config/services/driverModelServices.js";
import { getAddressCoordinate } from "../config/services/map.services.js";
import { sendMessageToSocketId } from "../socket.js";
import { findUserByID } from "../config/services/userModelServices.js";

// Create new ride request
export const createRideRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            passengerID, pickupLocation, dropoffLocation, vehicleType
        }:{
            passengerID:mongoose.Schema.Types.ObjectId;
            pickupLocation:LocationTypes;
            dropoffLocation:LocationTypes;
            vehicleType:VehicleTypeTypes;
        } = req.body;

        const newRide = await createRide({
            passengerID, pickupLocation, dropoffLocation, vehicleType
        });

        //-------------------------------------const pickupCoordiinates = await getAddressCoordinate(pickupLocation.address);
        //-------------------------------------const driversInRadius = await getDriversWithinRadius({ltd:pickupCoordiinates.ltd, lng:pickupCoordiinates.lng, radius:1});
        const driversInRadius = await getDriversWithinRadius({ltd:pickupLocation.latitude, lng:pickupLocation.longitude, radius:1});
        newRide.otp = "";

        const requestingPassenger = await findUserByID({userID:newRide.passengerID as mongoose.Schema.Types.ObjectId});

        if (!requestingPassenger) return next(new ErrorHandler("PassengerID not found", 404));
        
        //const {pickupLocation, dropoffLocation, fare, status, otp} = newRide;

        driversInRadius.map((driver) => {
            sendMessageToSocketId({
                socketID:driver.userID.socketID,
                eventName:"new-ride",
                message:{
                    _id:newRide._id,
                    pickupLocation:newRide.pickupLocation,
                    dropoffLocation:newRide.dropoffLocation,
                    fare:newRide.fare,
                    distance:newRide.distance,
                    duration:newRide.duration,
                    status:newRide.status,
                    otp:newRide.otp,
                    passengerName:requestingPassenger.name,
                    passengerEmail:requestingPassenger.email,
                    passengerMobile:requestingPassenger.mobile,
                    passengerGender:requestingPassenger.gender,
                    passengerSocketID:requestingPassenger.socketID
                }
            });
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
        const {rideID, driverID, status}:{rideID:mongoose.Schema.Types.ObjectId; driverID:mongoose.Schema.Types.ObjectId; status:RideStatusTypes;} = req.body;

        const acceptedRide = await findByIdAndUpdateRide({rideID, driverID, status}, {selectOtp:true});

        if (!acceptedRide) return next(new ErrorHandler("Internal server error", 500));


        console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO (1)");
        console.log({acceptedRide});
        console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO (2)");
        
        const driverDetailes = await findDriverByID({driverID});

        sendMessageToSocketId({
            socketID:acceptedRide.passengerID.socketID,
            eventName:"ride-accepted",
            message:{
                status:acceptedRide.status,
                otp:acceptedRide.otp,
                driverName:driverDetailes.userID.name,
                driverEmail:driverDetailes.userID.email,
                driverMobile:driverDetailes.userID.mobile,
                driverGender:driverDetailes.userID.gender,
                //driverUserID:acceptedRide.driverID,
                licenseNumber:acceptedRide.driverID.licenseNumber,
                vehicleDetailes:acceptedRide.driverID.vehicleDetailes,
                rating:acceptedRide.driverID.rating
            }
        });

        res.status(200).json({success:true, message:"Ride accepted", jsonData:acceptedRide});
    } catch (error) {
        next(error);
    }
};
// Get fare between two locations
export const getFareOfTrip = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {pickupLocation, dropoffLocation}:{dropoffLocation:string; pickupLocation:string;} = req.body;

        console.log({pickupLocation, dropoffLocation});
        
        const faresOfAllTypesOfVehicle = await getFare({pickupLocation, dropoffLocation});

        res.status(200).json({success:true, message:"Ride accepted", jsonData:faresOfAllTypesOfVehicle});
    } catch (error) {
        next(error);
    }
};
// Start ride by filling passenger otp by driver
export const startRide = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {rideID, otp}:{rideID:mongoose.Schema.Types.ObjectId; otp:string;} = req.body;
        const ride = await findRideById({rideID}, {selectOtp:true});

        if (!ride) return next(new ErrorHandler("Ride not found", 404));

        if (ride.status !== "accepted") return next(new ErrorHandler("Ride is not accepted", 401));
        if (ride.otp !== otp) return next(new ErrorHandler("Invalid OTP", 401));
            
        ride.otp = "";
        ride.status = "in-progress";

        await ride.save();

        sendMessageToSocketId({socketID:(ride as RideTypesPopulated).passengerID.socketID, eventName:"ride-started", message:{message:"ride start ho gai hai...."}})

        res.status(200).json({success:true, message:"Ride started", jsonData:ride});
    } catch (error) {
        next(error);
    }
};
