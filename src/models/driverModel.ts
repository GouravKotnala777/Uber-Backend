import jsonwebtoken from "jsonwebtoken";
import mongoose, { Model } from "mongoose";

export type VehicleTypeTypes = "car"|"motorcycle"|"auto"|"van";
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
    createdAt:Date;
    updatedAt:Date;

    generateToken:(driverID:mongoose.Schema.Types.ObjectId) => Promise<string>;
}

const driverSchema = new mongoose.Schema<DriverTypes>({
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
            enum:["car", "motorcycle", "auto", "van"]
        },
        vehicleModel:String,
        vehicleNumber:String,
        vehicleColor:String
    },
    availabilityStatus:{
        type:Boolean
    },
    rating:{
        type:Number,
        default:0
    }
}, {
    timestamps:true
});

driverSchema.methods.generateToken = async function (driverID:mongoose.Schema.Types.ObjectId) {
    const driverToken = await jsonwebtoken.sign({_id:driverID}, process.env.JWT_SECRET_DRIVER as string, {expiresIn:"3d"});
    return driverToken;
}

const driverModel:Model<DriverTypes> = mongoose.models.Driver || mongoose.model<DriverTypes>("Driver", driverSchema);

export default driverModel;