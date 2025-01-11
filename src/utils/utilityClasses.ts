import { NextFunction, Response } from "express";
import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "mongoose";
import { cookieOptions } from "./constants.js";
import twilio from "twilio";
import { UserTypes } from "./types.js";
import { getOTP } from "../controllers/rideController.js";

export class ErrorHandler extends Error {
    constructor(public message:string, public statusCode:number){
        super(message);
        this.statusCode = statusCode;
    }
};

//export type ResTypes<T> = Document<unknown, {}, T> & T & Required<{ _id: ObjectId; }>;
//export const sendApiResponse = <T>(res:Response, message:string, jsonData:ResTypes<T>) => {
//    res.status(200).json({success:true, message, jsonData});
//};

export type GenerateTokenType = {generateToken:(userID:mongoose.Schema.Types.ObjectId) => Promise<string>};
export const sendToken = async<T extends GenerateTokenType>(res:Response, documentModel:(Document<unknown, {}, T&GenerateTokenType> & (T&GenerateTokenType) & Required<{_id:ObjectId}>), cookieName:string) => {
    const createToken = await documentModel.generateToken(documentModel._id);
    res.cookie(cookieName, createToken, cookieOptions);
};

export const sendSMS = async<T>({receiverMobileNumber, document, next}:{receiverMobileNumber:string; document:Document<unknown, {}, T> & T & Required<{_id:Schema.Types.ObjectId;}>&{varificationOTP?:string; varificationOTPExpirs?:Date;}; next:NextFunction;}) => {
    // Your AccountSID and Auth Token from console.twilio.com
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_ACCOUNT_AUTH;
    const smsKey = process.env.TWILIO_SMS_KEY;
    const client = twilio(accountSid, authToken);
    try {
        const ttl = 2*60*1000;
        let expires = Date.now();
        expires += ttl;

        if (!smsKey || !receiverMobileNumber) return next(new ErrorHandler("All fields are required", 400));


        const newOTP = getOTP(6);

        const messageRes = await client.messages.create({
            body:`This is OTP generated for varification for Uber-frontend webapp ${newOTP}`,
            from:smsKey, // From a valid Twilio number
            to:receiverMobileNumber, // Text your number
        });
        
        console.log({messageRes});

        document.varificationOTP = newOTP;
        document.varificationOTPExpirs = new Date(Date.now() + 90000);

        await document.save();
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};