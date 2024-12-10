import mongoose from "mongoose";
import User from "../../models/userModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";

// Create new user
export const createUser = async({name, email, password, mobile, gender}:{name:string; email:string; password:string; mobile:string; gender:"male"|"female"|"other";}) => {
    if (!name || !email || !password || !mobile || !gender) throw new ErrorHandler("All fields are required", 400);
    const newUser = await User.create({
        name, email, password, mobile, gender
    });
    if (!newUser)  throw new ErrorHandler("Internal server error", 500);
    return newUser;
};
// Find user by _id
export const findUserByID = async({userID}:{userID:mongoose.Schema.Types.ObjectId;}) => {
    if (!userID) throw new ErrorHandler("UserID not found", 404);
    const findUserById = await User.findById(userID);
    if (!findUserById)  throw new ErrorHandler("User not found", 404);
    return findUserById;
};
// Find user by email or mobile
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
};
// Delete user by _id
export const deleteUserByID = async({userID}:{userID:mongoose.Schema.Types.ObjectId;}) => {
    if (!userID) throw new ErrorHandler("UserID not found", 404);
    const deleteUserById = await User.findByIdAndDelete(userID);
    if (!deleteUserById)  throw new ErrorHandler("Internal server error", 500);
    return deleteUserById;
};