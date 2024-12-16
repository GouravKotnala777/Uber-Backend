import mongoose from "mongoose";
import Driver, { DriverTypesPopulated, VehicleTypeTypes } from "../../models/driverModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";

// Create driver
export const createDriver = async({licenseNumber, userID, vehicleColor, vehicleModel, vehicleNumber, vehicleType}:{
    userID:mongoose.Schema.Types.ObjectId;
    licenseNumber:string;
    vehicleType:VehicleTypeTypes;
    vehicleModel:string;
    vehicleNumber:string;
    vehicleColor:string;
}) => {
    console.log({
        licenseNumber,
        vehicleType,
        vehicleModel,
        vehicleNumber,
        vehicleColor
    });
    
    if (!licenseNumber ||
        !vehicleType ||
        !vehicleModel ||
        !vehicleNumber ||
        !vehicleColor
    ) throw(new ErrorHandler("All fields are required", 404));

    const newDriver = await Driver.create({
        licenseNumber, userID, vehicleDetailes:{vehicleColor, vehicleModel, vehicleNumber, vehicleType}
    });
    if (!newDriver) throw(new ErrorHandler("Internal server error", 500));
    return newDriver;
};
// Find driver by driverID
export const findDriverByID = async({driverID}:{driverID:mongoose.Schema.Types.ObjectId;}) => {        
    if (!driverID) throw(new ErrorHandler("driverID is not found", 404));

    const findDriverByID = await Driver.findById(driverID);
    return findDriverByID;
};
// Find single driver by query
export const findSingleDriver = async({userID, licenseNumber, availabilityStatus, vehicleNumber}:{userID?:mongoose.Schema.Types.ObjectId; licenseNumber?:string; availabilityStatus?:boolean; vehicleNumber?:string;},
    options?:{populateUser?:boolean;}
) => {
        
    if (!userID && !licenseNumber && !availabilityStatus && !vehicleNumber) throw(new ErrorHandler("All fields are required", 400));
        let searchedDriver;
    if (options?.populateUser) {
        searchedDriver = await Driver.findOne({
            ...(userID&&{userID}),
            ...(licenseNumber&&{licenseNumber}),
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleNumber&&{vehicleNumber})
        }).populate({model:"User", path:"userID", select:"_id name email mobile gender role socketID"});
    }else{
        searchedDriver = await Driver.findOne({
            ...(userID&&{userID}),
            ...(licenseNumber&&{licenseNumber}),
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleNumber&&{vehicleNumber})
        });
    }
    return searchedDriver;
};
// Find all driver by query
export const findAllDrivers = async({availabilityStatus, vehicleModel, vehicleType, rating}:{availabilityStatus?:boolean; vehicleType?:VehicleTypeTypes; vehicleModel?:string; rating?:number;}, options?:{getDriverDetailes:boolean;}) => {
    let searchedAllDriver;
    if (options?.getDriverDetailes) {
        searchedAllDriver = await Driver.find({
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleType&&vehicleModel&&
                {vehicleDetailes:{
                ...(vehicleType&&{vehicleType}),
                ...(vehicleModel&&{vehicleModel})
            }}),
            ...(rating&&{rating})
        }).populate({model:"User", path:"userID", select:"_id name email mobile"});
    }
    else{
        searchedAllDriver = await Driver.find({
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleType&&vehicleModel&&
                {vehicleDetailes:{
                ...(vehicleType&&{vehicleType}),
                ...(vehicleModel&&{vehicleModel})
            }}),
            ...(rating&&{rating})
        });
    }
    return searchedAllDriver;
};
// Is driver exists
export const isDriverExists = async({userID, licenseNumber, vehicleNumber}:{userID:mongoose.Schema.Types.ObjectId; licenseNumber:string; vehicleNumber:string;}, options?:{populateUser:boolean;}) => {
    if (!userID && !licenseNumber && !vehicleNumber) throw new ErrorHandler("Can not pass empty body", 400);
    let searchedAllDriver;
    
    if (options?.populateUser) {
        searchedAllDriver = await Driver.find({
            $or:[
                {userID},
                {licenseNumber},
                {vehicleNumber}
            ]
        }).populate({model:"User", path:"userID", select:"_id name email mobile gender"});
    }
    else{
        searchedAllDriver = await Driver.find({
            $or:[
                {userID},
                {licenseNumber},
                {vehicleNumber}
            ]
        });
    }
    return searchedAllDriver;
};
// Find all available drivers within a given radius
export const getDriversWithinRadius = async({ltd, lng, radius}:{ltd:number; lng:number; radius:number;}) => {
    if (!ltd || !lng || !radius) throw new ErrorHandler("All fields are required", 400);

    const drivers = await Driver.find({
        location:{
            $geoWithin:{
                $centerSphere:[[ltd, lng], radius/6371]
            }
        }
    }).populate({model:"User", path:"userID", select:"_id name email mobile gender role socketID"}) as DriverTypesPopulated[];
    return drivers;
};