import Vehicle from "../../models/vehicleModel.js";
import { ErrorHandler } from "../../utils/utilityClasses.js";


// Create new vehicle
export const createVehicle = async({vehicleColor, vehicleModel, vehicleNumber, vehicleType, vehicleCapacity=3}:{vehicleColor:string; vehicleModel:string; vehicleNumber:string; vehicleType:string; vehicleCapacity:number}) => {
    if (!vehicleColor || !vehicleModel || !vehicleNumber || !vehicleType || !vehicleCapacity) throw new ErrorHandler("All fields are required", 400);
    const newVehicle = await Vehicle.create({
        vehicleColor, vehicleModel, vehicleNumber, vehicleType, vehicleCapacity: 3
    });
    if (!newVehicle) throw new ErrorHandler("Internal server error", 500);
    return newVehicle;
};