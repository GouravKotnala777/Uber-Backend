import jsonwebtoken from "jsonwebtoken";
import mongoose, { Model } from "mongoose";
import { UserTypes } from "./userModel.js";

export type VehicleTypeTypes = "uberAuto"|"uberX"|"uberMoto"|"uberScooty"|"uberComfort"|"uberHCV"|"uberPool"|"uberXL";
export interface LocationTypes {
    ltd:number;
    lng:number;
};
export interface DriverTypes {
    _id:mongoose.Schema.Types.ObjectId;
    userID:mongoose.Schema.Types.ObjectId;
    licenseNumber:string;
    vehicleDetailes:{
        vehicleType:VehicleTypeTypes;
        vehicleModel:string;
        vehicleNumber:string;
        vehicleColor:string;
    },
    availabilityStatus:boolean;
    rating:number;
    location:LocationTypes;
    createdAt:Date;
    updatedAt:Date;

    generateToken:(driverID:mongoose.Schema.Types.ObjectId) => Promise<string>;
}
export interface DriverTypesPopulated {
    _id:mongoose.Schema.Types.ObjectId;
    userID:Pick<UserTypes, "_id"|"name"|"email"|"gender"|"mobile"|"role"|"socketID">;
    licenseNumber:string;
    vehicleDetailes:{
        vehicleType:VehicleTypeTypes;
        vehicleModel:string;
        vehicleNumber:string;
        vehicleColor:string;
    },
    availabilityStatus:boolean;
    rating:number;
    location:LocationTypes;
    image?:string;
    createdAt:Date;
    updatedAt:Date;

    generateToken:(driverID:mongoose.Schema.Types.ObjectId) => Promise<string>;
}

const driverSchema = new mongoose.Schema<DriverTypes|DriverTypesPopulated>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    licenseNumber:{
        type:String,
        required:true
    },
    vehicleDetailes:{
        vehicleType:{
            type:String,
            default:"car",
            enum:["uberX", "uberComfort", "uberXL", "uberPool", "uberMoto", "uberScooty","uberAuto", "uberHCV"]
        },
        vehicleModel:String,
        vehicleNumber:String,
        vehicleColor:String
    },
    availabilityStatus:{
        type:Boolean,
        default:false
    },
    rating:{
        type:Number,
        default:0
    },
    location:{
        ltd:Number,
        lng:Number
    },
    image:String
}, {
    timestamps:true
});

driverSchema.methods.generateToken = async function (driverID:mongoose.Schema.Types.ObjectId) {
    const driverToken = await jsonwebtoken.sign({_id:driverID}, process.env.JWT_SECRET_DRIVER as string, {expiresIn:"3d"});
    return driverToken;
}

const driverModel:Model<DriverTypes|DriverTypesPopulated> = mongoose.models.Driver || mongoose.model<DriverTypes|DriverTypesPopulated>("Driver", driverSchema);

export default driverModel;