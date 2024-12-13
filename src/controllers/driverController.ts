import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { cookieOptions } from "../utils/constants.js";
import { createDriver, findSingleDriver, getDriversWithinRadius, isDriverExists } from "../config/services/driverModelServices.js";
import Driver, { VehicleTypeTypes } from "../models/driverModel.js";
import User from "../models/userModel.js";
import { getAddressCoordinate } from "../config/services/map.services.js";

// Driver register
export const driverRegister = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {licenseNumber, vehicleColor, vehicleModel, vehicleNumber, vehicleType, password}:{
            licenseNumber:string;
            vehicleType:VehicleTypeTypes;
            vehicleModel:string;
            vehicleNumber:string;
            vehicleColor:string;
            password:string;
        } = req.body;
        const userID = (req as AuthenticatedRequest).user._id;

        const searchedDriver = await isDriverExists({userID, licenseNumber, vehicleNumber});

        if (searchedDriver.length !== 0) return next(new ErrorHandler("Driver already exist", 301));

        const searchedUserForPassword = await User.findById(userID).select("+password");
        
        const isPasswordMatched = await searchedUserForPassword?.comparePassword(password);

        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password", 402));

        const createNewDriver = await createDriver({
            licenseNumber,
            userID,
            vehicleColor,
            vehicleModel,
            vehicleNumber,
            vehicleType
        });

        res.status(200).json({success:true, message:"Driver register successful", jsonData:createNewDriver})
    } catch (error) {
        console.log(error);
        next(error);
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
export const allNearbyDrivers = async(req:Request<{}, {}, {}, {radius:string; address:string;}>, res:Response, next:NextFunction) => {
    try {
        const {radius, address} = req.query;

        const coordinates = await getAddressCoordinate(address);
        const allAvailableDriversNearMe = await getDriversWithinRadius({lng:coordinates.lng, ltd:coordinates.ltd, radius:Number(radius)});
        
        res.status(200).json({success:true, message:"All nearby drivers", jsonData:allAvailableDriversNearMe});
    } catch (error) {
        next(error);
    }
};