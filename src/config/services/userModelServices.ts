import mongoose from "mongoose";
import User from "../../models/userModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";
import { UserTypes } from "../../utils/types.js";

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
export const findUserByID = async({userID}:{userID:mongoose.Schema.Types.ObjectId;}, options?:{selectPassword:boolean;}) => {
    if (!userID) throw new ErrorHandler("UserID not found", 404);

    let findUserById:(mongoose.Document<unknown, {}, UserTypes> & UserTypes & Required<{
        _id: mongoose.Schema.Types.ObjectId;
    }>)|null = null;

    if (options?.selectPassword) {
        findUserById = await User.findById(userID).select("+password");
    }
    else{
        findUserById = await User.findById(userID);
        if (!findUserById)  throw new ErrorHandler("User not found", 404);
    }
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
// Find user by _id and then update
export const findUserByIDAndUpdate = async({userID, name, password, mobile, gender, image}:{userID:mongoose.Schema.Types.ObjectId; name?:string; password?:string; mobile?:string; gender?:"male"|"female"|"other"; image?:string;}) => {
    if (!userID) throw new ErrorHandler("UserID not found", 404);
    if (!name && !password && !mobile && !gender && !image) throw new ErrorHandler("All fields for update are empty", 400);
    const updateUser = await User.findByIdAndUpdate(userID, {
        ...(name&&{name}),
        ...(password&&{password}),
        ...(mobile&&{mobile}),
        ...(gender&&{gender}),
        ...(image&&{image})
    }, {new:true});
    if (!updateUser)  throw new ErrorHandler("Update user not found", 404);
    return updateUser;
};
// Delete user by _id
export const deleteUserByID = async({userID}:{userID:mongoose.Schema.Types.ObjectId;}) => {
    if (!userID) throw new ErrorHandler("UserID not found", 404);
    const deleteUserById = await User.findByIdAndDelete(userID);
    if (!deleteUserById)  throw new ErrorHandler("Internal server error", 500);
    return deleteUserById;
};