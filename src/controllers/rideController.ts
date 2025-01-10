import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Ride from "../models/rideModel.js";
import { createRide, findByIdAndUpdateRide, findRideById, getFare } from "../config/services/rideModelServices.js";
import { ErrorHandler } from "../utils/utilityClasses.js";
import crypto from "crypto";
import { findDriverByID, getDriversWithinRadius } from "../config/services/driverModelServices.js";
import { getAddressCoordinate } from "../config/services/map.services.js";
import { sendMessageToSocketId } from "../socket.js";
import { findUserByID } from "../config/services/userModelServices.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { AcceptRideRequestFormTypes, CreateRideRequestFormTypes, GetAllRidesQueryTypes, RideTypesPopulated, StartRideRequestFormTypes } from "../utils/types.js";
import { NEW_RIDE, RIDE_ACCEPTED, RIDE_CANCELLED, RIDE_ENDED, RIDE_STARTED } from "../utils/constants.js";

// Get my rides as passenger (except with requested status)
export const myAllPastRidesPassenger = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequest).user._id;

        const myAllRides = await Ride.find({
            passengerID:userID,
            status:{
                $ne:"requested"
            }
        }).populate({model:"Driver", path:"driverID"}) as RideTypesPopulated[];

        res.status(200).json({success:true, message:"All rides", jsonData:myAllRides});
    } catch (error) {
        next(error);
    }
};
// Get my rides as driver (except with requested status)
export const myAllPastRidesDriver = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const driverID = (req as AuthenticatedRequest).driver._id;

        const myAllRides = await Ride.find({
            driverID,
            status:{
                $ne:"requested"
            }
        }) as RideTypesPopulated[];

        res.status(200).json({success:true, message:"All rides", jsonData:myAllRides});
    } catch (error) {
        next(error);
    }
};
// Create new ride request
export const createRideRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            passengerID, pickupLocation, dropoffLocation, vehicleType
        }:CreateRideRequestFormTypes = req.body;

        const newRide = await createRide({
            passengerID, pickupLocation, dropoffLocation, vehicleType
        });

        //-------------------------------------const pickupCoordiinates = await getAddressCoordinate(pickupLocation.address);
        //-------------------------------------const driversInRadius = await getDriversWithinRadius({ltd:pickupCoordiinates.ltd, lng:pickupCoordiinates.lng, radius:1});
        const driversInRadius = await getDriversWithinRadius({ltd:pickupLocation.latitude, lng:pickupLocation.longitude, radius:1, vehicleType});
        newRide.otp = "";

        const requestingPassenger = await findUserByID({userID:newRide.passengerID as mongoose.Schema.Types.ObjectId});

        if (!requestingPassenger) return next(new ErrorHandler("PassengerID not found", 404));
        
        //const {pickupLocation, dropoffLocation, fare, status, otp} = newRide;

        driversInRadius.map((driver) => {
            sendMessageToSocketId({
                socketID:driver.userID.socketID,
                eventName:NEW_RIDE,
                message:{
                    _id:newRide._id,
                    pickupLocation:newRide.pickupLocation,
                    dropoffLocation:newRide.dropoffLocation,
                    fare:newRide.fare,
                    distance:newRide.distance,
                    duration:newRide.duration,
                    status:newRide.status,
                    otp:newRide.otp,
                    passengerID:requestingPassenger._id,
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
        const {rideID, status}:AcceptRideRequestFormTypes = req.body;
        const driver = (req as AuthenticatedRequest).driver;

        if (!driver) return next(new ErrorHandler("driverID not found", 402));

        const acceptedRide = await findByIdAndUpdateRide({rideID, driverID:driver._id, status}, {selectOtp:true});

        if (!acceptedRide) return next(new ErrorHandler("Internal server error", 500));

        sendMessageToSocketId({
            socketID:acceptedRide.passengerID.socketID,
            eventName:RIDE_ACCEPTED,
            message:{
                rideID:rideID,
                status:acceptedRide.status,
                otp:acceptedRide.otp,
                driverName:driver.userID.name,
                driverEmail:driver.userID.email,
                driverMobile:driver.userID.mobile,
                driverGender:driver.userID.gender,
                driverID:driver._id,
                driverSocketID:driver.userID.socketID,
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
        const {rideID, otp}:StartRideRequestFormTypes = req.body;
        const driverID = (req as AuthenticatedRequest).driver?._id;

        if (!driverID) return next(new ErrorHandler("driverID not found", 401));

        const ride = await findRideById({rideID}, {selectOtp:true});

        if (!ride) return next(new ErrorHandler("Ride not found", 404));

        if (ride.status !== "accepted") return next(new ErrorHandler("Ride is not accepted", 401));
        if (ride.otp !== otp) return next(new ErrorHandler("Invalid OTP", 401));
        if (driverID.toString() !== ride.driverID.toString()) return next(new ErrorHandler("You are not riding this ride", 401));
            
        ride.otp = "";
        ride.status = "in-progress";

        await ride.save();

        sendMessageToSocketId({socketID:(ride as RideTypesPopulated).passengerID.socketID, eventName:RIDE_STARTED, message:{message:"ride start ho gai hai...."}})

        res.status(200).json({success:true, message:"Ride started", jsonData:ride});
    } catch (error) {
        next(error);
    }
};
// End currently active ride by driver
export const endRide = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {rideID}:{rideID:mongoose.Schema.Types.ObjectId;} = req.body;
        const driverID = (req as AuthenticatedRequest).driver._id;
        
        const ride = await findRideById({rideID}, {populatePassenger:true});
        
        if (!ride) return next(new ErrorHandler("Ride not found", 404));
        
        if (ride.status !== "in-progress") return next(new ErrorHandler("Ride has not started", 401));
        if (ride.driverID.toString() !== driverID.toString()) return next(new ErrorHandler("Your are not driving it", 401));
        
        ride.status = "completed";
        
        await ride.save();
        
        sendMessageToSocketId({socketID:(ride as RideTypesPopulated).passengerID.socketID, eventName:RIDE_ENDED, message:{rideID:ride._id}});        
        
        res.status(200).json({success:true, message:"Ride ended", jsonData:ride});
    } catch (error) {
        next(error);
    }
};
// Cancel currently active ride by driver
export const cancelRide = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {rideID}:{rideID:mongoose.Schema.Types.ObjectId;} = req.body;
        const driverID = (req as AuthenticatedRequest).driver._id;
        
        const ride = await findRideById({rideID}, {populatePassenger:true});
        
        if (!ride) return next(new ErrorHandler("Ride not found", 404));
        
        if (ride.status === "cancelled" || ride.status === "completed" || ride.status === "requested") return next(new ErrorHandler("Ride has not cancellable", 401));
        if (ride.driverID.toString() !== driverID.toString()) return next(new ErrorHandler("Your are not driving it", 401));
        
        ride.status = "cancelled";
        
        await ride.save();
        
        sendMessageToSocketId({socketID:(ride as RideTypesPopulated).passengerID.socketID, eventName:RIDE_CANCELLED, message:{rideID:ride._id}});        
        
        res.status(200).json({success:true, message:"You cancelled this ride", jsonData:ride});
    } catch (error) {
        next(error);
    }
};

// Dashboard (admin only)
export const getAllRides = async(req:Request<{}, {}, {}, GetAllRidesQueryTypes>, res:Response, next:NextFunction) => {
    try {
        const {
            driverID,
            pickUpLatitude,
            pickUpLongitude,
            dropoffLatitude,
            dropoffLongitude,
            status,
            startDate,
            endDate
        } = req.query;
        
        if (startDate && endDate) {
            console.log({startDate, endDate});
            console.log({startDate:new Date(startDate), endDate:new Date(endDate)});
        }

        
        
        const rides = await Ride.find({
            ...(driverID&&{driverID}),
            ...(pickUpLatitude && pickUpLongitude && {pickupLocation:{
                ...(pickUpLatitude&&{latitude:Number(pickUpLatitude)}),
                ...(pickUpLongitude&&{longitude:Number(pickUpLongitude)}),
            }}),
            ...(dropoffLatitude && dropoffLongitude && {dropoffLocation:{
                ...(dropoffLatitude&&{latitude:Number(dropoffLatitude)}),
                ...(dropoffLongitude&&{longitude:Number(dropoffLongitude)}),
            }}),
            ...(status&&{status}),
            ...((startDate || endDate )&&{createdAt:{...(startDate&&{$gte:new Date(startDate)}), ...(endDate&&{$lte:new Date(endDate)})}})
        }).populate({model:"Driver", path:"driverID", select:"licenseNumber vehicleDetailes rating"}) as RideTypesPopulated[];

        res.status(200).json({success:true, message:"All rides", jsonData:rides});
    } catch (error) {
        next(error);
    }
};