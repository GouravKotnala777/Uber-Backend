import mongoose, { Model } from "mongoose";

export type RideStatusTypes = "requested"|"accepted"|"in-progress"|"completed"|"cancelled";
export interface RideTypes {
    _id:mongoose.Schema.Types.ObjectId;
    driverID:mongoose.Schema.Types.ObjectId;
    passengerID:mongoose.Schema.Types.ObjectId;
    pickupLocation:{
        latitude:number;
        longitude:number;
        address:string;
    },
    dropoffLocation:{
        latitude:number;
        longitude:number;
        address:string;
    },
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
}

const rideSchema = new mongoose.Schema<RideTypes>({
    driverID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
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
        type:Number,
        required:true
    },
    fare:{
        type:Number,
        required:true
    },
    duration:{
        type:Number,
        required:true
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

const rideModel:Model<RideTypes> = mongoose.models.Ride || mongoose.model<RideTypes>("Ride", rideSchema);

export default rideModel;