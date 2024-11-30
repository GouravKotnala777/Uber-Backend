import mongoose from "mongoose";
import User from "../../models/userModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";

export const createUser = async({name, email, password, mobile, gender}:{name:string; email:string; password:string; mobile:string; gender:"male"|"female"|"other";}) => {
    if (!name || !email || !password || !mobile || !gender) throw new Error("this is the error...");
    const newUser = await User.create({
        name, email, password, mobile, gender
    });
    if (!newUser)  throw new Error("this is the error...");
    return newUser;
}
export const findUserByID = async({userID}:{userID:mongoose.Schema.Types.ObjectId;}) => {
    if (!userID) throw new Error("this is the error...");
    const findUserById = await User.findById(userID);
    if (!findUserById)  throw new Error("this is the error...");
    return findUserById;
}
export const findUser = async({email, mobile}:{email?:string; mobile?:string;}, options?:{selectPassword:boolean;}) => {
    if (!email && !mobile) throw new ErrorHandler("All fields are required", 400);
    
    let findUser = null;
    if (options?.selectPassword) {
        findUser = await User.findOne({
            ...(email && {email}),
            ...(mobile && {mobile}),
        }).select("+password");
    }
    else{
        findUser = await User.findOne({
            ...(email && {email}),
            ...(mobile && {mobile}),
        });
    }
    return findUser;
}
export const deleteUserByID = async({userID}:{userID:mongoose.Schema.Types.ObjectId;}) => {
    if (!userID) throw new Error("this is the error...");
    const deleteUserById = await User.findByIdAndDelete(userID);
    if (!deleteUserById)  throw new Error("this is the error...");
    return deleteUserById;
}