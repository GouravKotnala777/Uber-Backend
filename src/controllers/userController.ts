import { NextFunction, Request, Response } from "express";
import { createUser, findUser, findUserByID, findUserByIDAndUpdate } from "../config/services/userModelServices.js";
import { ErrorHandler, sendSMS, sendToken } from "../utils/utilityClasses.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { cookieOptions, USER_TOKEN_NAME } from "../utils/constants.js";
import User from "../models/userModel.js";
import { LoginFormTypes, RegisterFormTypes, UpdateMyProfileFormTypes } from "../utils/types.js";
import { getOTP } from "./rideController.js";

// User register
export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {firstName, lastName, email, password, mobile, gender}:RegisterFormTypes = req.body;
        
        const isUserExists = await findUser({email});

        if (isUserExists) return next(new ErrorHandler("Email already exist", 301));

        const createNewUser = await createUser({name:firstName.concat(lastName), email, password, mobile, gender});

        await sendSMS({receiverMobileNumber:mobile, document:createNewUser, next});

        res.status(200).json({success:true, message:"OTP sended to your mobile", jsonData:{}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// User login
export const login = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password}:LoginFormTypes = req.body;

        const isUserExists = await findUser({email}, {selectPassword:true});

        if (!isUserExists) return next(new ErrorHandler("Wrong email or password1", 402));
        
        const isPasswordMatched = await isUserExists.comparePassword(password);

        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password2", 402));

        if (!isUserExists.isVarified) {
            await sendSMS({receiverMobileNumber:isUserExists.mobile, document:isUserExists, next});
            //return res.status(200).json({success:true, message:"OTP sended to your mobile", jsonData:{}});
            //return next(new ErrorHandler("OTP sended to your mobile", 200));
        }
        else{
            await sendToken(res, isUserExists, USER_TOKEN_NAME);
        }

        res.status(200).json({success:true, message:isUserExists.isVarified?"User login successful":"OTP has sent to your mobile", jsonData:{}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// User verification thorugh OPT
export const verifyUser = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {otp}:{otp:number;} = req.body;

        const userWithValidOTP = await User.findOne({
            isVarified:false,
            varificationOTP:otp,
            varificationOTPExpirs:{
                $gt:Date.now()
            }
        });

        if (!userWithValidOTP) return next(new ErrorHandler("User with that otp not found", 404));

        userWithValidOTP.varificationOTP = undefined;
        userWithValidOTP.varificationOTPExpirs = undefined;
        userWithValidOTP.isVarified = true;

        await userWithValidOTP.save();

        await sendToken(res, userWithValidOTP, USER_TOKEN_NAME);

        res.status(200).json({success:true, message:"User varified successfully", jsonData:userWithValidOTP});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// My Profile
export const myProfile = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedRequest).user;

        res.status(200).json({success:true, message:"My profile", jsonData:user});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Update my profile
export const updateMyProfile = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, password, mobile, gender, oldPassword}:UpdateMyProfileFormTypes = req.body;
        const user = (req as AuthenticatedRequest).user;

        const findUserByField = await findUserByID({userID:user._id}, {selectPassword:true});

        if (!oldPassword) return next(new ErrorHandler("Old password not found", 404));
        
        const isPasswordMatched = await findUserByField?.comparePassword(oldPassword);
        
        if (!isPasswordMatched) return next(new ErrorHandler("Old password not is incorrect", 401));

        const findUserAndUpdate = await findUserByIDAndUpdate({
            userID:user._id,
            name,
            password,
            mobile,
            gender
        });

        res.status(200).json({success:true, message:"Your profile updated", jsonData:findUserAndUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Set/Update my profile image
export const uploadProfileImage = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        const image = req.file;
        const user = (req as AuthenticatedRequest).user;

        if (!image) return next(new ErrorHandler("Image not found", 404));
        
        const updateProfile = await findUserByIDAndUpdate({userID:user._id, image:image.filename});

        res.status(200).json({success:true, message:"Profile image uploaded", jsonData:updateProfile});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Remove my profile image
export const removeProfileImage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        
        const updateProfile = await User.findByIdAndUpdate(user._id, {image:null}, {new:true});        

        res.status(200).json({success:true, message:"Profile image removed", jsonData:updateProfile});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// User logout
export const logout = async(req:Request, res:Response, next:NextFunction) => {
    try {
        //const user = (req as AuthenticatedRequest).user;

        res.status(200).cookie(USER_TOKEN_NAME, "", {httpOnly:true, secure:true, sameSite:"none", expires:new Date(0)}).json({success:true, message:"Logout successfull", jsonData:{}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};