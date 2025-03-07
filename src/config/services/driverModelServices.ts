import mongoose from "mongoose";
import Driver from "../../models/driverModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";
import { DriverTypesPopulated, VehicleTypeTypes } from "../../utils/types.js";

// Create driver
export const createDriver = async({licenseNumber, userID, vehicleColor, vehicleModel, vehicleNumber, vehicleType, vehicleCapacity}:{
    userID:mongoose.Schema.Types.ObjectId;
    licenseNumber:string;
    vehicleType:VehicleTypeTypes;
    vehicleModel:string;
    vehicleNumber:string;
    vehicleColor:string;
    vehicleCapacity:number;
}) => {
    if (!licenseNumber ||
        !vehicleType ||
        !vehicleModel ||
        !vehicleNumber ||
        !vehicleColor || !vehicleCapacity
    ) throw(new ErrorHandler("All fields are required", 404));

    const newDriver = await Driver.create({
        licenseNumber:licenseNumber.toLowerCase(),
        userID,
        vehicleDetailes:{vehicleColor:vehicleColor.toLowerCase(), vehicleModel:vehicleModel.toLowerCase(), vehicleNumber:vehicleNumber.toLowerCase(), vehicleType:vehicleType, vehicleCapacity},
        location:{ // hard coded (only for development)
            ltd : 28.4339049,
            lng : 77.3223915
        }
    });
    if (!newDriver) throw(new ErrorHandler("Internal server error", 500));
    return newDriver;
};
// Find driver by driverID
export const findDriverByID = async({driverID}:{driverID:mongoose.Schema.Types.ObjectId;}) => {        
    if (!driverID) throw(new ErrorHandler("driverID is not found", 404));

    const findDriverByID = await Driver.findById(driverID)
                            .populate({model:"User", path:"userID", select:"name email mobile gender socketID"}) as DriverTypesPopulated;

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
            ...(licenseNumber&&{licenseNumber:licenseNumber.toLowerCase()}),
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleNumber&&{vehicleNumber})
        }).populate({model:"User", path:"userID", select:"_id name email mobile gender role socketID"});
    }else{
        searchedDriver = await Driver.findOne({
            ...(userID&&{userID}),
            ...(licenseNumber&&{licenseNumber:licenseNumber.toLowerCase()}),
            ...(availabilityStatus&&{availabilityStatus}),
            ...(vehicleNumber&&{vehicleNumber:vehicleNumber.toLowerCase()})
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
                ...(vehicleModel&&{vehicleModel:vehicleModel.toLowerCase()})
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
                ...(vehicleModel&&{vehicleModel:vehicleModel.toLowerCase()})
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
                {licenseNumber:licenseNumber.toLowerCase()},
                {vehicleNumber:vehicleNumber.toLowerCase()}
            ]
        }).populate({model:"User", path:"userID", select:"_id name email mobile gender"});
    }
    else{
        searchedAllDriver = await Driver.find({
            $or:[
                {userID},
                {licenseNumber:licenseNumber.toLowerCase()},
                {vehicleNumber:vehicleNumber.toLowerCase()}
            ]
        });
    }
    return searchedAllDriver;
};
// Find driver by id and then update
export const findDriverByIDAndUpdate = async({driverID, licenseNumber, vehicleDetailes, availabilityStatus, revenue, image}:{driverID:mongoose.Schema.Types.ObjectId; licenseNumber?:string;
    vehicleDetailes?:{
        vehicleNumber?:string;
        vehicleColor?:string;
        vehicleModel?:string;
        vehicleType?:string;};
        availabilityStatus?:boolean;
        revenue?:number;
        image?:string;}, options?:{populateUser:boolean;}) => {
    if (!driverID && !licenseNumber && !vehicleDetailes && !revenue && !image) throw new ErrorHandler("Can not pass empty body", 400);


    const findDriver = await Driver.findById(driverID);

    let updatedDriver:DriverTypesPopulated|null = null;

    if (options?.populateUser) {
        updatedDriver = await Driver.findByIdAndUpdate(driverID, {
            vehicleDetailes:{
                ...(vehicleDetailes?.vehicleNumber?{vehicleNumber:vehicleDetailes.vehicleNumber.toLowerCase()}:{vehicleNumber:findDriver?.vehicleDetailes.vehicleNumber.toLowerCase()}),
                ...(vehicleDetailes?.vehicleColor?{vehicleColor:vehicleDetailes.vehicleColor.toLowerCase()}:{vehicleColor:findDriver?.vehicleDetailes.vehicleColor.toLowerCase()}),
                ...(vehicleDetailes?.vehicleModel?{vehicleModel:vehicleDetailes.vehicleModel.toLowerCase()}:{vehicleModel:findDriver?.vehicleDetailes.vehicleModel.toLowerCase()}),
                ...(vehicleDetailes?.vehicleType?{vehicleType:vehicleDetailes.vehicleType}:{vehicleType:findDriver?.vehicleDetailes.vehicleType})
            },
            ...(licenseNumber&&{licenseNumber:licenseNumber.toLowerCase()}),
            ...(revenue&&{$inc:{revenue}}),
            ...((availabilityStatus === true || availabilityStatus === false)&&{availabilityStatus}),
            ...(image&&{image})
        }, {new:true}).populate({model:"User", path:"userID", select:"name email mobile gender role socketID"}) as DriverTypesPopulated;
    }
    else{
        updatedDriver = await Driver.findByIdAndUpdate(driverID, {
            vehicleDetailes:{
                ...(vehicleDetailes?.vehicleNumber?{vehicleNumber:vehicleDetailes.vehicleNumber.toLowerCase()}:{vehicleNumber:findDriver?.vehicleDetailes.vehicleNumber.toLowerCase()}),
                ...(vehicleDetailes?.vehicleColor?{vehicleColor:vehicleDetailes.vehicleColor.toLowerCase()}:{vehicleColor:findDriver?.vehicleDetailes.vehicleColor.toLowerCase()}),
                ...(vehicleDetailes?.vehicleModel?{vehicleModel:vehicleDetailes.vehicleModel.toLowerCase()}:{vehicleModel:findDriver?.vehicleDetailes.vehicleModel.toLowerCase()}),
                ...(vehicleDetailes?.vehicleType?{vehicleType:vehicleDetailes.vehicleType}:{vehicleType:findDriver?.vehicleDetailes.vehicleType})
            },
            ...(licenseNumber&&{licenseNumber:licenseNumber.toLowerCase()}),
            ...(revenue&&{revenue}),
            ...((availabilityStatus === true || availabilityStatus === false)&&{availabilityStatus}),
            ...(image&&{image})
        }, {new:true});

    }
    
    
    return updatedDriver;
};
// Find all available drivers within a given radius
export const getDriversWithinRadius = async({ltd, lng, radius, vehicleType}:{ltd:number; lng:number; radius:number; vehicleType:VehicleTypeTypes;}) => {
    if (!ltd || !lng || !radius || !vehicleType) throw new ErrorHandler("All fields are required", 400);

    const drivers = await Driver.find({
        location:{
            $geoWithin:{
                $centerSphere:[[ltd, lng], radius/6371]
            }
        },
        availabilityStatus:true,
        "vehicleDetailes.vehicleType":vehicleType
    }).populate({model:"User", path:"userID", select:"_id name email mobile gender role socketID"}) as DriverTypesPopulated[];
    return drivers;
};