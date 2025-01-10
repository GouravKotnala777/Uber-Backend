import { NextFunction, Request, Response } from "express";
import { ErrorHandler, sendToken } from "../utils/utilityClasses.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { cookieOptions } from "../utils/constants.js";
import { createDriver, findDriverByIDAndUpdate, findSingleDriver, isDriverExists } from "../config/services/driverModelServices.js";
import Driver from "../models/driverModel.js";
import User from "../models/userModel.js";
import { findUser } from "../config/services/userModelServices.js";
import { DriverLoginFormTypes, DriverRegisterFormTypes, DriverTypesPopulated, GetAllDriversQueryTypes, UpdateMyDriverProfileFormTypes } from "../utils/types.js";

// Driver register
export const driverRegister = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {licenseNumber, vehicleColor, vehicleModel, vehicleNumber, vehicleType, password}:DriverRegisterFormTypes = req.body;
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

        await sendToken(res, createNewDriver, "driverToken");

        res.status(200).json({success:true, message:"Driver register successful", jsonData:createNewDriver})
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Driver login
export const driverLogin = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password, licenseNumber, vehicleNumber}:DriverLoginFormTypes = req.body;

        const isUserExists = await findUser({email}, {selectPassword:true});

        if (!isUserExists) return next(new ErrorHandler("Wrong email or password1", 402));
        
        const isPasswordMatched = await isUserExists.comparePassword(password);

        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password2", 402));

        const isDriverExists = await findSingleDriver({userID:isUserExists._id});

        if (!isDriverExists) return next(new ErrorHandler("Driver not exist", 402));        

        if (isDriverExists?.licenseNumber !== licenseNumber) return next(new ErrorHandler("Licence number not matched", 404));
        if (isDriverExists?.vehicleDetailes.vehicleNumber !== vehicleNumber) return next(new ErrorHandler("Vehicle number not matched", 404));
        
        //const createDriverToken = await isDriverExists.generateToken(isDriverExists._id);
        
        await sendToken(res, isDriverExists, "driverToken");
        //res.cookie("driverToken", createDriverToken, cookieOptions);

        //console.log({createDriverToken});

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
        const {licenseNumber, vehicleColor, vehicleModel, vehicleNumber, vehicleType, availabilityStatus}:UpdateMyDriverProfileFormTypes = req.body;
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
        }, {populateUser:true});

        res.status(200).json({success:true, message:"Your profile updated", jsonData:findUserAndUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Set/Update my driving profile image
export const uploadDriverProfileImage = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        const image = req.file;
        const driver = (req as AuthenticatedRequest).driver;

        if (!image) return next(new ErrorHandler("Image not found", 404));
        
        const updatedDriverProfile = await findDriverByIDAndUpdate({driverID:driver._id, image:image.filename}, {populateUser:true});

        res.status(200).json({success:true, message:"Driver profile image uploaded", jsonData:updatedDriverProfile});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Remove Driver profile image
export const removeDriverProfileImage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const driver = (req as AuthenticatedRequest).driver;
        
        const updateProfile = await Driver.findByIdAndUpdate(driver._id, {image:null}, {new:true})
                            .populate({model:"User", path:"userID", select:"name email mobile gender role socketID"}) as DriverTypesPopulated;

        res.status(200).json({success:true, message:"Profile image removed", jsonData:updateProfile});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Driver logout
export const driverLogout = async(req:Request, res:Response, next:NextFunction) => {
    try {
        //const driver = (req as AuthenticatedRequest).driver;

        res.status(200).cookie("driverToken", "", {httpOnly:true, secure:true, sameSite:"none", expires:new Date(0)}).json({success:true, message:"Logout successfull", jsonData:{}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};


// Fetch all drivers for dashboard (admin only) 
export const getAllDrivers = async(req:Request, res:Response, next:NextFunction) => {
    try {
        //const driver = (req as AuthenticatedRequest).driver;
        const {availabilityStatus, rating, fromDate, upToDate}:GetAllDriversQueryTypes = req.query;

        const allDriversByQueries = await Driver.find({
            ...(availabilityStatus&&{
                availabilityStatus:availabilityStatus === "true"?true:false
            }),
            ...(fromDate&&upToDate&&{
                createdAt:{$gte:fromDate, $lte:upToDate}
            }),
            ...(rating&&{rating})
        }).populate({model:"User", path:"userID", select:"_id gender"}) as DriverTypesPopulated[];

        const allDrivers = await Driver.find().populate({model:"User", path:"userID", select:"_id gender"}) as DriverTypesPopulated[];;
        const driversAvailablity = {
            available:allDrivers.filter((i) => i.availabilityStatus === true).length,
            unavailable:allDrivers.filter((i) => i.availabilityStatus === false).length,
        };
        const driversGender = {
            male:allDrivers.filter((i) => i.userID.gender === "male").length,
            female:allDrivers.filter((i) => i.userID.gender === "female").length,
            other:allDrivers.filter((i) => i.userID.gender === "other").length
        };
        const driverRatings = {
            "0 star":allDrivers.filter((i) => i.rating === 0).length,
            "1 star":allDrivers.filter((i) => i.rating === 1).length,
            "2 stars":allDrivers.filter((i) => i.rating === 2).length,
            "3 stars":allDrivers.filter((i) => i.rating === 3).length,
            "4 stars":allDrivers.filter((i) => i.rating === 4).length,
            "5 stars":allDrivers.filter((i) => i.rating === 5).length
        };
        res.status(200).json({success:true, message:"All fetched drivers", jsonData:{allDriversByQueries, driversAvailablity, driversGender, driverRatings}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};