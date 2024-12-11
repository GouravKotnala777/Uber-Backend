import { NextFunction, Request, Response } from "express";
import {getAddressCoordinate, getAutoCompleteSuggestion, getDistanceTime} from "../config/services/map.services.js";


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
export const getDistance = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {origin, destination}:{origin:string; destination:string;} = req.body;
        const distance = await getDistanceTime({origin, destination});
        res.status(200).json({success:true, message:"fetched distance", jsonData:distance});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const getSuggestions = async(req:Request<{}, {}, {}, {input:string;}>, res:Response, next:NextFunction) => {
    try {
        const {input} = req.query;
        console.log({input});        
        const suggestions = await getAutoCompleteSuggestion({input});
        res.status(200).json({success:true, message:"fetched suggestions", jsonData:suggestions});
    } catch (error) {
        console.log(error);
        next(error);
    }
};