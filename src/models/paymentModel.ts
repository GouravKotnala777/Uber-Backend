import mongoose from "mongoose";

export interface PaymentTypes{
    _id:mongoose.Schema.Types.ObjectId;
    rideID:mongoose.Schema.Types.ObjectId;
    amount:number;
    paymentMethod:"cash"|"card"|"wallet";
    paymentStatus:"pending"|"completed"|"failed";
    createdAt:Date;
    updatedAt:Date;
}

const paymentSchema = new mongoose.Schema({
    rideID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Ride",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true,
        default:"cash",
        enum:["cash", "card", "wallet"]
    },
    paymentStatus:{
        type:String,
        required:true,
        default:"pending",
        enum:["pending", "completed", "failed"]
    }
}, {timestamps:true});

const paymentModel = mongoose.model("Payment", paymentSchema);

export default paymentModel;