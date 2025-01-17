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
}, {
    timestamps:true
});



const vehicleMModel:Model<VehicleTypes> = mongoose.models.Vehicle || mongoose.model<VehicleTypes>("Vehicle", vehicleSchema);

export default vehicleMModel;