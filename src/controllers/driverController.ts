import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { cookieOptions } from "../utils/constants.js";
import { createDriver, findDriverByID, findDriverByIDAndUpdate, findSingleDriver, isDriverExists } from "../config/services/driverModelServices.js";
import { VehicleTypeTypes } from "../models/driverModel.js";
import User from "../models/userModel.js";
import { findUser } from "../config/services/userModelServices.js";

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
        const {email, password, licenseNumber, vehicleNumber}:{email:string; password:string; licenseNumber:string; vehicleNumber:string;} = req.body;

        const isUserExists = await findUser({email}, {selectPassword:true});

        if (!isUserExists) return next(new ErrorHandler("Wrong email or password1", 402));
        
        const isPasswordMatched = await isUserExists.comparePassword(password);

        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password2", 402));

        const isDriverExists = await findSingleDriver({userID:isUserExists._id});

        if (!isDriverExists) return next(new ErrorHandler("Driver not exist", 402));        

        if (isDriverExists?.licenseNumber !== licenseNumber) return next(new ErrorHandler("Licence number not matched", 404));
        if (isDriverExists?.vehicleDetailes.vehicleNumber !== vehicleNumber) return next(new ErrorHandler("Vehicle number not matched", 404));
        
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
        const driver = (req as AuthenticatedRequest).driver;

        const loginedDriver = await findSingleDriver({userID:driver.userID._id}, {populateUser:true});

        res.status(200).json({success:true, message:"logined driver profile", jsonData:loginedDriver});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Update my driving profile
export const updateMyDrivingProfile = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {licenseNumber, vehicleColor, vehicleModel, vehicleNumber, vehicleType, availabilityStatus}:{licenseNumber?:string; vehicleColor?:string; vehicleModel?:string; vehicleNumber?:string; vehicleType?:string; availabilityStatus?:boolean;} = req.body;
        const driver = (req as AuthenticatedRequest).driver;
        
        const findUserAndUpdate = await findDriverByIDAndUpdate({
            driverID:driver._id,
            licenseNumber,
            vehicleDetailes:{
                vehicleColor,
                vehicleModel,
                vehicleNumber,
                vehicleType
            },
            availabilityStatus
        });

        res.status(200).json({success:true, message:"Your profile updated", jsonData:findUserAndUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};