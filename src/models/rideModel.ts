import mongoose, { Model } from "mongoose";
import { RideTypes, RideTypesPopulated } from "../utils/types.js";

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
    vehicleDetailes:{
        vehicleType:{
            type:String,
            enum:["uberX", "uberComfort", "uberXL", "uberPool", "uberMoto", "uberScooty","uberAuto", "uberHCV"]
        },
        vehicleModel:{
            type:String,
            lowercase:true
        },
        vehicleNumber:{
            type:String,
            lowercase:true
        },
        vehicleColor:{
            type:String,
            lowercase:true
        },
        vehicleCapacity:Number
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
            required:true,
            lowercase:true
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
            required:true,
            lowercase:true
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