import mongoose from "mongoose";
import Driver, { VehicleTypeTypes } from "../../models/driverModel.js";
import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../utils/utilityClasses.js";
import { UserTypes } from "../../models/userModel.js";

// Create driver
export const createDriver = async({availabilityStatus, licenseNumber, rating, userID, vehicleColor, vehicleModel, vehicleNumber, vehicleType}:{
    userID:mongoose.Schema.Types.ObjectId;
    licenseNumber:string;
    vehicleType:VehicleTypeTypes;
    vehicleModel:string;
    vehicleNumber:string;
    vehicleColor:string;
    availabilityStatus:boolean;
    rating:number;
}) => {
    console.log({
        licenseNumber,
        vehicleType,
        vehicleModel,
        vehicleNumber,
        vehicleColor,
        availabilityStatus,
        rating,
    });
    
    if (!licenseNumber ||
        !vehicleType ||
        !vehicleModel ||
        !vehicleNumber ||
        !vehicleColor ||
        !availabilityStatus
    ) throw(new ErrorHandler("All fields are required", 404));

    const newDriver = await Driver.create({
        availabilityStatus, licenseNumber, rating, userID, vehicleDetailes:{vehicleColor, vehicleModel, vehicleNumber, vehicleType}
    });
    if (!newDriver) throw(new ErrorHandler("Internal server error", 500));
    return newDriver;
};
// Find driver by driverID
export const findDriverByID = async({driverID}:{driverID:mongoose.Schema.Types.ObjectId;}) => {        
    if (!driverID) throw(new ErrorHandler("driverID is not found", 404));

    const findDriverByID = await Driver.findById(driverID);
    return findDriverByID;
};
// Find single driver by query
export const findSingleDriver = async({userID, licenseNumber, availabilityStatus, vehicleNumber}:{userID?:mongoose.Schema.Types.ObjectId; licenseNumber?:string; availabilityStatus?:boolean; vehicleNumber?:string;},
    options?:{populateUser?:boolean;}
) => {
        
    if (!userID && !licenseNumber && !availabilityStatus && !vehicleNumber) throw(new ErrorHandler("All fields are required", 400));
        let searchedDriver;
    if (options?.populateUser) {
        searchedDriver = await Driver.findOne({
            ...(userID&&{userID}),
            ...(licenseNumber&&{licenseNumber}),
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleNumber&&{vehicleNumber})
        }).populate({model:"User", path:"userID", select:"_id name email mobile gender"});
    }else{
        searchedDriver = await Driver.findOne({
            ...(userID&&{userID}),
            ...(licenseNumber&&{licenseNumber}),
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleNumber&&{vehicleNumber})
        });
    }
    return searchedDriver;
};
// Find all driver by query
export const findAllDrivers = async({availabilityStatus, vehicleModel, vehicleType, rating}:{availabilityStatus?:boolean; vehicleType?:VehicleTypeTypes; vehicleModel?:string; rating?:number;}) => {
    const searchedAllDriver = await Driver.find({
        ...(availabilityStatus&&{availabilityStatus}),
        ...(vehicleType&&vehicleModel&&
            {vehicleDetailes:{
            ...(vehicleType&&{vehicleType}),
            ...(vehicleModel&&{vehicleModel})
        }}),
        ...(rating&&{rating})
    });
    return searchedAllDriver;
};
// Is driver exists
export const isDriverExists = async({userID, licenseNumber, vehicleNumber}:{userID:mongoose.Schema.Types.ObjectId; licenseNumber:string; vehicleNumber:string;}, options?:{populateUser:boolean;}) => {
    if (!userID && !licenseNumber && !vehicleNumber) throw new ErrorHandler("Can not pass empty body", 400);
    let searchedAllDriver;
    
    if (options?.populateUser) {
        searchedAllDriver = await Driver.find({
            $or:[
                {userID},
                {licenseNumber},
                {vehicleNumber}
            ]
        }).populate({model:"User", path:"userID", select:"_id name email mobile gender"});
    }
    else{
        searchedAllDriver = await Driver.find({
            $or:[
                {userID},
                {licenseNumber},
                {vehicleNumber}
            ]
        });
    }
    return searchedAllDriver;
};