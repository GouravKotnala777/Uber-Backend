import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { createDriver, isDriverExists } from "../config/services/driverModelServices.js";

// Driver register
export const driverRegister = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {availabilityStatus, licenseNumber, rating, vehicleColor, vehicleModel, vehicleNumber, vehicleType}:{
            licenseNumber:string;
            vehicleType:string;
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
