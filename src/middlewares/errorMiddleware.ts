import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilityClasses.js";


export const errorMiddleware = async(err:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
    let message:string = "";
    if (err.name === "CastError") {
        err.statusCode = 400;
        message = "Wrong ObjectId Format";
    }
    else if (err.name === "ValidationError") {
        err.statusCode = 400;
        message = err.message;
    }
    else{
        err.statusCode = 500;
        message = err.message;
    }
    console.log("%%%%%%%%%%%%%%%%%%%%%%");
    console.log({name:err.name});
    console.log({message:err.message});
    console.log({status:err.statusCode});
    console.log("%%%%%%%%%%%%%%%%%%%%%%");
    
    res.status(err.statusCode).json({success:false, message, jsonData:{errName:err.name, errorMessage:err.message}});
};