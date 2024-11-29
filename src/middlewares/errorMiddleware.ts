import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilityClasses.js";


export const errorMiddleware = async(err:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
    let message:string = "";
    if (err.name === "CastError") {
        message = "Wrong ObjectId Format"
    }
    else{
        message = err.message;
    }
    console.log("%%%%%%%%%%%%%%%%%%%%%%");
    console.log(err.message);
    console.log("%%%%%%%%%%%%%%%%%%%%%%");
    
    res.status(err.statusCode).json({success:false, message, jsonData:{errName:err.name, errorMessage:err.message}});
};