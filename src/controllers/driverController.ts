import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { cookieOptions } from "../utils/constants.js";
import { createDriver, findAllDrivers, findSingleDriver, isDriverExists } from "../config/services/driverModelServices.js";
import Driver, { VehicleTypeTypes } from "../models/driverModel.js";

// Driver register
export const driverRegister = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {availabilityStatus, licenseNumber, rating, vehicleColor, vehicleModel, vehicleNumber, vehicleType}:{
            licenseNumber:string;
            vehicleType:VehicleTypeTypes;
            vehicleModel:string;
            vehicleNumber:string;
            vehicleColor:string;
            availabilityStatus:boolean;
            rating:number;
        } = req.body;
        const userID = (req as AuthenticatedRequest).user._id;

        const searchedDriver = await isDriverExists({userID, licenseNumber, vehicleNumber});

        if (searchedDriver.length !== 0) return next(new ErrorHandler("Driver already exist", 301));

        const createNewDriver = await createDriver({
            availabilityStatus,
            licenseNumber,
            rating,
            userID,
            vehicleColor,
            vehicleModel,
            vehicleNumber,
            vehicleType
        });

        res.status(200).json({success:true, message:"Driver register successful", jsonData:createNewDriver})
    } catch (error) {
        console.log(error);
    }
};
// Driver login
export const driverLogin = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const loginedUser = (req as AuthenticatedRequest).user;
        const {licenseNumber}:{licenseNumber:string;} = req.body;

        if (!loginedUser) return next(new ErrorHandler("Login first", 401));

        const isDriverExists = await Driver.findOne({userID:loginedUser._id});

        if (!isDriverExists) return next(new ErrorHandler("Driver not exists", 404));

        console.log(isDriverExists.licenseNumber, licenseNumber);
        

        if (isDriverExists.licenseNumber !== licenseNumber) return next(new ErrorHandler("Licence number not matched", 404));
        
        const createDriverToken = await isDriverExists.generateToken(isDriverExists._id);
        
        res.cookie("driverToken", createDriverToken, cookieOptions);

        console.log({createDriverToken});

        res.status(200).json({success:true, message:"Driver login successful", jsonData:isDriverExists})
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// My Profile
export const driverProfile = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedRequest).user;

        const loginedDriver = await findSingleDriver({userID:user._id}, {populateUser:true});

        res.status(200).json({success:true, message:"logined driver profile", jsonData:loginedDriver});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Find all nearby drivers
export const allNearbyDrivers = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {availabilityStatus, vehicleType}:{availabilityStatus:boolean;
            vehicleType:VehicleTypeTypes;} = req.body;
        const drivers = await findAllDrivers({
            availabilityStatus,
            vehicleType
        });
        res.status(200).json({success:true, message:"All nearby drivers", jsonData:drivers});
    } catch (error) {
        next(error);
    }
};