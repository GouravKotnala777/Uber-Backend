import mongoose from "mongoose";
import Ride, { LocationTypes, RideStatusTypes } from "../../models/rideModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";
import { findAllDrivers } from "./driverModelServices.js";
import { getDistanceTime } from "./map.services.js";
import { VehicleTypeTypes } from "../../models/driverModel.js";
import { getOTP } from "../../controllers/rideController.js";

// Calculate fare
export const getFare = async({pickupLocation, dropoffLocation}:{pickupLocation:string; dropoffLocation:string;}) => {   
    if (!pickupLocation || !dropoffLocation) throw new ErrorHandler("Pickup and dropoffLocation are required", 400);

    const distanceTime = await getDistanceTime({origin:pickupLocation, destination:dropoffLocation});

    const baseFare = {
        auto:30, car:50, motorcycle:20
    };
    const perKmRate = {
        auto:10, car:15, motorcycle:8
    };
    const perMinuteRate = {
        auto:2, car:3, motorcycle:1.5
    };
    const fare:{[P in VehicleTypeTypes]:number;} = {
        auto:Math.round(baseFare.auto + ((distanceTime.distance.value/1000)*perKmRate.auto) + ((distanceTime.duration.value/60)*perMinuteRate.auto)),
        car:Math.round(baseFare.car + ((distanceTime.distance.value/1000)*perKmRate.car) + ((distanceTime.duration.value/60)*perMinuteRate.car)),
        motorcycle:Math.round(baseFare.motorcycle + ((distanceTime.distance.value/1000)*perKmRate.motorcycle) + ((distanceTime.duration.value/60)*perMinuteRate.motorcycle))
    };    
    return fare;    
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
        fare:fare[vehicleType],
        otp:getOTP(6)
    });

    if (!newRide) throw new ErrorHandler("Internal server error", 500);

    return newRide;
};
// Find ride by id and update
export const findByIdAndUpdateRide = async({
    rideID,
    distance,
    pickupLocation,
    dropoffLocation,
    status
}:{
    rideID:mongoose.Schema.Types.ObjectId;
    distance?:string;
    pickupLocation?:string;
    dropoffLocation?:string;
    status?:RideStatusTypes;
}) => {
    const updateRide = await Ride.findByIdAndUpdate(rideID, {
        ...(distance&&{distance}),
        ...(pickupLocation&&{pickupLocation}),
        ...(dropoffLocation&&{dropoffLocation}),
        ...(status&&{status})
    });
    return updateRide;
};