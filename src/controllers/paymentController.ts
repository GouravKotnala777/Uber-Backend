import { NextFunction, Request, Response } from "express";
import Payment, { PaymentMethodTypes, PaymentStatusTypes } from "../models/paymentModel.js";
import mongoose from "mongoose";
import { ErrorHandler } from "../utils/utilityClasses.js";
import Ride from "../models/rideModel.js";
import { sendMessageToSocketId } from "../socket.js";
import { PAYMENT_DONE } from "../utils/constants.js";
import Driver from "../models/driverModel.js";
import { DriverTypesPopulated } from "../utils/types.js";
import { findDriverByIDAndUpdate } from "../config/services/driverModelServices.js";


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

        if (!updatedRide) return next(new ErrorHandler("Internal server error", 500));
        
        //const driver = await Driver.findBy(updatedRide.driverID).populate({model:"User", path:"userID", select:"socketID"}) as DriverTypesPopulated;
        const driver = await findDriverByIDAndUpdate({
            driverID:updatedRide.driverID as mongoose.Schema.Types.ObjectId,
            revenue:amount
        }, {populateUser:true});
        if (!driver) return next(new ErrorHandler("Driver not found", 404));
        

        sendMessageToSocketId({socketID:driver.userID.socketID, eventName:PAYMENT_DONE, message:`Payment ${amount} done`})

        res.status(200).json({success:true, message:"Payment done", jsonData:newPayment});
    } catch (error) {
        console.log(error);
        next(error);        
    }
}