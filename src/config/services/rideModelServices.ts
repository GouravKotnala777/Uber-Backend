import mongoose from "mongoose";
import Ride, { LocationTypes, RideStatusTypes, RideTypesPopulated } from "../../models/rideModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";
import { findAllDrivers } from "./driverModelServices.js";
import { getDistanceTime } from "./map.services.js";
import { VehicleTypeTypes } from "../../models/driverModel.js";
import { getOTP } from "../../controllers/rideController.js";

// Calculate fare
export const getFare = async({pickupLocation, dropoffLocation}:{pickupLocation:string; dropoffLocation:string;}) => {   
    if (!pickupLocation || !dropoffLocation) throw new ErrorHandler("Pickup and dropoffLocation are required", 400);

    //----------------------------------------const distanceTime = await getDistanceTime({origin:pickupLocation, destination:dropoffLocation});

    const distanceTime = {
        distance:{
          text:"1.0 km",
          value:976
        },
        duration:{
          text:"3 mins",
          value:177
        },
        status:"OK"
      }

      const baseFare = {
        uberAuto: 30,
        uberX: 50,
        uberScooty: 20,
        uberMoto: 25,
        uberComfort: 70,
        uberHCV: 100,
        uberPool: 40,
        uberXL: 80,
    };
    
    const perKmRate = {
        uberAuto: 10,
        uberX: 15,
        uberScooty: 8,
        uberMoto: 9,
        uberComfort: 20,
        uberHCV: 25,
        uberPool: 7,
        uberXL: 18,
    };
    
    const perMinuteRate = {
        uberAuto: 2,
        uberX: 3,
        uberScooty: 1.5,
        uberMoto: 1.8,
        uberComfort: 4,
        uberHCV: 5,
        uberPool: 1.2,
        uberXL: 3.5,
    };
    
    const fare:{[P in VehicleTypeTypes]:number;} = {
        uberAuto:Math.round(baseFare.uberAuto + ((distanceTime.distance.value/1000)*perKmRate.uberAuto) + ((distanceTime.duration.value/60)*perMinuteRate.uberAuto)),
        uberX:Math.round(baseFare.uberX + ((distanceTime.distance.value/1000)*perKmRate.uberX) + ((distanceTime.duration.value/60)*perMinuteRate.uberX)),
        uberMoto:Math.round(baseFare.uberMoto + ((distanceTime.distance.value/1000)*perKmRate.uberMoto) + ((distanceTime.duration.value/60)*perMinuteRate.uberMoto)),
        uberScooty:Math.round(baseFare.uberScooty + ((distanceTime.distance.value/1000)*perKmRate.uberScooty) + ((distanceTime.duration.value/60)*perMinuteRate.uberScooty)),
        uberComfort:Math.round(baseFare.uberComfort + ((distanceTime.distance.value/1000)*perKmRate.uberComfort) + ((distanceTime.duration.value/60)*perMinuteRate.uberComfort)),
        uberHCV:Math.round(baseFare.uberHCV + ((distanceTime.distance.value/1000)*perKmRate.uberHCV) + ((distanceTime.duration.value/60)*perMinuteRate.uberHCV)),
        uberPool:Math.round(baseFare.uberPool + ((distanceTime.distance.value/1000)*perKmRate.uberPool) + ((distanceTime.duration.value/60)*perMinuteRate.uberPool)),
        uberXL:Math.round(baseFare.uberXL + ((distanceTime.distance.value/1000)*perKmRate.uberXL) + ((distanceTime.duration.value/60)*perMinuteRate.uberXL)),
    };    
    return {fare, distance:distanceTime.distance.value, duration:distanceTime.duration.value};    
};
// Create new ride
export const createRide = async({
    passengerID,
    pickupLocation,
    dropoffLocation,
    vehicleType
}:{
    passengerID:mongoose.Schema.Types.ObjectId;
    pickupLocation:LocationTypes;
    dropoffLocation:LocationTypes;
    vehicleType:VehicleTypeTypes;
}) => {

    if (!passengerID || !pickupLocation || !dropoffLocation || !vehicleType) throw new ErrorHandler("All fields are required", 400);

    const fare = await getFare({pickupLocation:pickupLocation.address, dropoffLocation:dropoffLocation.address});

    const newRide = await Ride.create({
        passengerID,
        pickupLocation,
        dropoffLocation,
        fare:fare.fare[vehicleType],
        distance:fare.distance,
        duration:fare.duration,
        otp:getOTP(6)
    });

    if (!newRide) throw new ErrorHandler("Internal server error", 500);

    return newRide;
};
// Find ride by id
export const findRideById = async({
    rideID
}:{
    rideID:mongoose.Schema.Types.ObjectId;
}, options?:{selectOtp?:boolean; populatePassenger?:boolean;}) => {
    let ride = null;
    if (options?.selectOtp) {
        ride = await Ride.findById(rideID)
        .select("+otp")
        .populate({model:"User", path:"passengerID", select:"socketID"});
        //.populate({model:"Driver", path:"driverID", select:"licenseNumber vehicleDetailes rating"}) as RideTypesPopulated;
    }
    else{
        if (options?.populatePassenger) {
            ride = await Ride.findById(rideID)
            .populate({model:"User", path:"passengerID", select:"socketID"});
            //.populate({model:"Driver", path:"driverID", select:"licenseNumber vehicleDetailes rating"}) as RideTypesPopulated;
            
        }
        else{
            ride = await Ride.findById(rideID);
        }
    }
    return ride;
};
// Find ride by id and update
export const findByIdAndUpdateRide = async({
    rideID,
    driverID,
    distance,
    pickupLocation,
    dropoffLocation,
    status,
    otp
}:{
    rideID:mongoose.Schema.Types.ObjectId;
    driverID?:mongoose.Schema.Types.ObjectId;
    distance?:string;
    pickupLocation?:string;
    dropoffLocation?:string;
    status?:RideStatusTypes;
    otp?:string;
}, options?:{selectOtp:boolean;}) => {
    let updateRide:RideTypesPopulated|null = null;
    if (options?.selectOtp) {
        updateRide = await Ride.findByIdAndUpdate(rideID, {
            ...(driverID&&{driverID}),
            ...(distance&&{distance}),
            ...(pickupLocation&&{pickupLocation}),
            ...(dropoffLocation&&{dropoffLocation}),
            ...(status&&{status}),
            ...(otp&&{otp})
        }, {new:true})
        .select("+otp")
        .populate({model:"User", path:"passengerID", select:"socketID"})
        .populate({model:"Driver", path:"driverID", select:"licenseNumber vehicleDetailes rating"}) as RideTypesPopulated;
    }
    else{
        updateRide = await Ride.findByIdAndUpdate(rideID, {
            ...(driverID&&{driverID}),
            ...(distance&&{distance}),
            ...(pickupLocation&&{pickupLocation}),
            ...(dropoffLocation&&{dropoffLocation}),
            ...(status&&{status})
        }, {new:true})
        .populate({model:"User", path:"passengerID", select:"socketID"})
        .populate({model:"Driver", path:"driverID", select:"licenseNumber vehicleDetailes rating"}) as RideTypesPopulated;
    }
    return updateRide;
};
//    const ride = await Ride.findById(rideID);

//    if (!ride) throw new ErrorHandler("Ride not found", 404);

//    ride.status = "in-progress";

//    await ride.save();

//    return ride;
//};
//const updateRideController = async(req:Request, res:Response, next:NextFunction) => {
//    try {
//        const {rideID}:{rideID:mongoose.Schema.Types.ObjectId;} = req.body;
//        const ride = await findRideByID2({rideID});

//        ride.status = "in-progress";

//        await ride.save();
//    } catch (error) {
//        next(error);        
//    }
//};