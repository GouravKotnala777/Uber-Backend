import jsonwebtoken from "jsonwebtoken";
import mongoose, { Model } from "mongoose";
import { DriverTypes, DriverTypesPopulated } from "../utils/types.js";


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