import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import Chat from "../models/chatModel.js";
import mongoose from "mongoose";
import { ErrorHandler } from "../utils/utilityClasses.js";
import { sendMessageToSocketId } from "../socket.js";

// Create new chat
export const createChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {receiver, receiverSocketID, content, senderType}:{receiver:mongoose.Schema.Types.ObjectId; receiverSocketID:string; content:string; senderType:"user"|"driver"} = req.body;
        
        const user = senderType === "user" ? (req as AuthenticatedRequest).user : (req as AuthenticatedRequest).driver;

        if (!receiver || !content) return next(new ErrorHandler("All fields are required", 400));
        
        const newChat = await Chat.create({
            sender:user._id,
            receiver:receiver,
            content
        });

        if (!newChat) return next(new ErrorHandler("Internal server error", 500));

        sendMessageToSocketId({
            socketID:receiverSocketID,
            eventName:"new-message",
            message:{
                sender:user._id,
                receiver:receiver,
                content,
                date:newChat.createdAt
            }
        });

        res.status(200).json({success:true, message:"message created", jsonData:newChat});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Fetch my chats
export const getMyChats = async(req:Request, res:Response, next:NextFunction) => {
    try {
        
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Fetch all chats for admin use only
export const getAllChats = async(req:Request, res:Response, next:NextFunction) => {
    try {
        
    } catch (error) {
        console.log(error);
        next(error);
    }
};
// Delete selected chats for admin use only
export const deleteSelectedChats = async(req:Request, res:Response, next:NextFunction) => {
    try {
        
    } catch (error) {
        console.log(error);
        next(error);
    }
};