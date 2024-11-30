import { NextFunction, Request, Response } from "express";
import jsonWebToken from "jsonwebtoken";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { findUserByID } from "../config/services/userModelServices.js";
import { ObjectId } from "mongoose";
import { UserTypes } from "../models/userModel.js";

export interface AuthenticatedRequest extends Request {
    user:UserTypes;
}

export const isUserAuthenticated = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const cookie = req.cookies?.userToken;

        if (!cookie || cookie === "null") return next(new ErrorHandler("cookie not found", 404));

        const verifyToken = await jsonWebToken.verify(cookie, process.env.JWT_SECRET as string);

        const findById = await findUserByID({userID:verifyToken as ObjectId});

        if (!findById) return next(new ErrorHandler("User not found", 404));

        (req as AuthenticatedRequest).user = findById;
        next();
    } catch (error) {
        console.log(error);
        
        res.status(402).json({success:false, message:error, jsonData:error})
    }
};