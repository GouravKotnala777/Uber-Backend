import mongoose, { Model, ObjectId } from "mongoose";
import { UserTypes } from "./userModel.js";
import { DriverTypes } from "./driverModel.js";



export interface ReviewTypes {
    _id:ObjectId;
    passengerID:ObjectId;
    driverID:ObjectId;
    rideID:ObjectId;
    rating:number;
    comment:string;
    createdAt:Date;
    updatedAt:Date;
};
export interface ReviewTypesPopulated {
    _id:ObjectId;
    passengerID:UserTypes;
    driverID:DriverTypes;
    rideID:ObjectId;
    rating:number;
    comment:string;
    createdAt:Date;
    updatedAt:Date;
};

const reviewSchema = new mongoose.Schema<ReviewTypes|ReviewTypesPopulated>({
    passengerID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    driverID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    rideID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Ride",
        required:true
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true,
        default:3
    },
    comment:{
        type:String,
        maxlength:[40, "maximum words for cumment is 40"]
    }
}, {timestamps:true});

const reviewModel:Model<ReviewTypes|ReviewTypesPopulated> = mongoose.models.Review || mongoose.model<ReviewTypes|ReviewTypesPopulated>("Review", reviewSchema);

export default reviewModel;