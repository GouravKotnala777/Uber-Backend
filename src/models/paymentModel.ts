import mongoose, { Model } from "mongoose";

export type PaymentMethodTypes = "cash"|"card"|"wallet";
export type PaymentStatusTypes = "pending"|"completed"|"failed";
export interface PaymentTypes{
    _id:mongoose.Schema.Types.ObjectId;
    rideID:mongoose.Schema.Types.ObjectId;
    amount:number;
    paymentMethod:PaymentMethodTypes;
    paymentStatus:PaymentStatusTypes;
    createdAt:Date;
    updatedAt:Date;
};

const paymentSchema = new mongoose.Schema<PaymentTypes>({
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

const paymentModel:Model<PaymentTypes> = mongoose.models.Payment || mongoose.model<PaymentTypes>("Payment", paymentSchema);

export default paymentModel;