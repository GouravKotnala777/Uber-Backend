import { NextFunction, Request, Response } from "express";
import { createUser, findUser, findUserByID, findUserByIDAndUpdate } from "../config/services/userModelServices.js";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { cookieOptions } from "../utils/constants.js";

// User register
export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {firstName, lastName, email, password, mobile, gender}:{firstName:string; lastName:string; email:string; password:string; mobile:string; gender:"male"|"female"|"other";} = req.body;
        
        const isUserExists = await findUser({email});

        if (isUserExists) return next(new ErrorHandler("Email already exist", 301));

        const createNewUser = await createUser({name:firstName.concat(lastName), email, password, mobile, gender});

        res.status(200).json({success:true, message:"register successful", jsonData:createNewUser})
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// User login
export const login = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password}:{email:string; password:string;} = req.body;

        const isUserExists = await findUser({email}, {selectPassword:true});

        if (!isUserExists) return next(new ErrorHandler("Wrong email or password1", 402));
        
        const isPasswordMatched = await isUserExists.comparePassword(password);

        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password2", 402));

        const createToken = await isUserExists.generateToken(isUserExists._id);

        //res.cookie("userToken", createToken, {httpOnly:true, secure:true, sameSite:"none"})
        res.cookie("userToken", createToken, cookieOptions);

        console.log({createToken});

        res.status(200).json({success:true, message:"register successful", jsonData:isUserExists})
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
        const {name, password, mobile, gender, oldPassword}:{name?:string; password?:string; mobile?:string; gender?:"male"|"female"|"other"; oldPassword:string;} = req.body;
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