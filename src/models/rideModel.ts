import mongoose, { Model } from "mongoose";
import { UserTypes } from "./userModel.js";
import { DriverTypes } from "./driverModel.js";

export type RideStatusTypes = "requested"|"accepted"|"in-progress"|"completed"|"cancelled";
export interface LocationTypes {
    latitude:number;
    longitude:number;
    address:string;
};
export interface RideTypes {
    _id:mongoose.Schema.Types.ObjectId;
    driverID:mongoose.Schema.Types.ObjectId;
    passengerID:mongoose.Schema.Types.ObjectId;
    pickupLocation:LocationTypes;
    dropoffLocation:LocationTypes;
    distance:number;
    fare:number;
    duration:number;
    status:RideStatusTypes;
    paymentID:string;
    orderID:string;
    signature:string;
    otp:string;
    createdAt:Date;
    updatedAt:Date;
};
export interface RideTypesPopulated {
    _id:mongoose.Schema.Types.ObjectId;
    driverID:DriverTypes;
    passengerID:UserTypes;
    pickupLocation:LocationTypes;
    dropoffLocation:LocationTypes;
    distance:number;
    fare:number;
    duration:number;
    status:RideStatusTypes;
    paymentID:string;
    orderID:string;
    signature:string;
    otp:string;
    createdAt:Date;
    updatedAt:Date;
};

const rideSchema = new mongoose.Schema<RideTypes|RideTypesPopulated>({
    driverID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    passengerID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    pickupLocation:{
        latitude:{
            type:Number,
            required:true
        },
        longitude:{
            type:Number,
            required:true
        },
        address:{
            type:String,
            required:true
        }
    },
    dropoffLocation:{
        latitude:{
            type:Number,
            required:true
        },
        longitude:{
            type:Number,
            required:true
        },
        address:{
            type:String,
            required:true
        }
    },
    distance:{
        type:Number
    },
    fare:{
        type:Number,
        required:true
    },
    duration:{
        type:Number
    },
    status:{
        type:String,
        required:true,
        enum:["requested", "accepted", "in-progress", "cancelled", "completed"],
        default:"requested"
    },
    paymentID:{
        type:String
    },
    orderID:{
        type:String
    },
    signature:{
        type:String
    },
    otp:{
        type:String,
        select:false
    }
},
{
    timestamps:true
});

const rideModel:Model<RideTypes|RideTypesPopulated> = mongoose.models.Ride || mongoose.model<RideTypes|RideTypesPopulated>("Ride", rideSchema);

export default rideModel;