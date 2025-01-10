import { NextFunction, Response } from "express";
import mongoose, { Document } from "mongoose";
import { UserTypes } from "./types.js";
import { ObjectId } from "mongoose";
import { cookieOptions } from "./constants.js";


export class ErrorHandler extends Error {
    constructor(public message:string, public statusCode:number){
        super(message);
        this.statusCode = statusCode;
    }
};

export type GenerateTokenType = {generateToken:(userID:mongoose.Schema.Types.ObjectId) => Promise<string>};
export const sendToken = async<T extends GenerateTokenType>(res:Response, documentModel:(Document<unknown, {}, T&GenerateTokenType> & (T&GenerateTokenType) & Required<{_id:ObjectId}>), cookieName:string) => {
    const createToken = await documentModel.generateToken(documentModel._id);
    res.cookie(cookieName, createToken, cookieOptions);
};