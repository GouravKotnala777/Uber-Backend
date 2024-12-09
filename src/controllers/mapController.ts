import { NextFunction, Request, Response } from "express";
import {getAddressCoordinate} from "../config/services/map.services.js";


export const getCoordinates = async(req:Request, res:Response, next:NextFunction) => {
    const {address} = req.query;

    console.log({address});
    
    try {
        const coordinates = await getAddressCoordinate(address as string);
        
        res.status(200).json({success:true, message:"this is string", jsonData:coordinates});
    } catch (error) {
        res.status(404).json({success:false, message:"Coordinates not found", jsonData:error});
    }
};