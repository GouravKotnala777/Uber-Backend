import mongoose, { Model } from "mongoose";
import { VehicleTypeTypes } from "../utils/types.js";

export interface VehicleTypes {
    _id:mongoose.Schema.Types.ObjectId;
    vehicleType:VehicleTypeTypes;
    vehicleModel:string;
    vehicleNumber:string;
    vehicleColor:string;
    vehicleCapacity:number;
};

const vehicleSchema = new mongoose.Schema<VehicleTypes>({
    vehicleType:{
        type:String,
        default:"uberX",
        enum:["uberX", "uberComfort", "uberXL", "uberPool", "uberMoto", "uberScooty","uberAuto", "uberHCV"]
    },
    vehicleModel:String,
    vehicleNumber:String,
    vehicleColor:String,
    vehicleCapacity:Number
}, {
    timestamps:true
});



const vehicleMModel:Model<VehicleTypes> = mongoose.models.Vehicle || mongoose.model<VehicleTypes>("Vehicle", vehicleSchema);

export default vehicleMModel;