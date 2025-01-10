import mongoose, { Model, ObjectId } from "mongoose";
import { ReviewTypes, ReviewTypesPopulated } from "../utils/types.js";


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
        validate:{
            validator:function(value:string) {
                return value.split(" ").length <= 40
            },
            message:"Maximum words for comment is 40"
        }
    }
}, {timestamps:true});

const reviewModel:Model<ReviewTypes|ReviewTypesPopulated> = mongoose.models.Review || mongoose.model<ReviewTypes|ReviewTypesPopulated>("Review", reviewSchema);

export default reviewModel;