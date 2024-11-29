import { NextFunction, Request, Response } from "express";
import { createUser, findUser } from "../config/services/userModelServices.js";
import { ErrorHandler } from "../utils/utilityClasses.js";


export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, mobile, gender}:{name:string; email:string; password:string; mobile:string; gender:"male"|"female"|"other";} = req.body;

        const isUserExists = await findUser({email});

        if (isUserExists) return next(new ErrorHandler("Email already exist", 301));

        const createNewUser = await createUser({name, email, password, mobile, gender});

        res.status(200).json({success:true, message:"register successful", jsonData:createNewUser})
    } catch (error) {
        console.log(error);
    }
};