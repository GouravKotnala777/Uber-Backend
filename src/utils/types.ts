import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";


// ****** USER RELATED TYPES ******
export interface UserTypes {
    _id:mongoose.Schema.Types.ObjectId;
    name:string;
    email:string;
    password:string;
    mobile:string;
    gender:"male"|"female"|"other";
    role:"user"|"admin";
    socketID:string;
    image?:string;
    comparePassword:(password:string) => Promise<boolean>;
    generateToken:(userID:mongoose.Schema.Types.ObjectId) => Promise<string>;
    verifyToken:() => JwtPayload;
}
// register request types
export interface RegisterFormTypes extends Pick<UserTypes, "email"|"password"|"mobile"|"gender">{
    firstName:string;
    lastName:string;
};
// login request types
export type LoginFormTypes = Pick<UserTypes, "email"|"password">;
// update my profile request types 
export interface UpdateMyProfileFormTypes extends Partial<Pick<UserTypes, "password"|"mobile"|"gender">>{
    name?:string;
    oldPassword:string;
};


// ****** DRIVER RELATED TYPES ******
export type VehicleTypeTypes = "uberAuto"|"uberX"|"uberMoto"|"uberScooty"|"uberComfort"|"uberHCV"|"uberPool"|"uberXL";
export interface VehicleDetailesTypes{
    vehicleType:VehicleTypeTypes;
    vehicleModel:string;
    vehicleNumber:string;
    vehicleColor:string;
};
export interface LocationTypes {
    ltd:number;
    lng:number;
};
export interface DriverTypes {
    _id:mongoose.Schema.Types.ObjectId;
    userID:mongoose.Schema.Types.ObjectId;
    licenseNumber:string;
    vehicleDetailes:VehicleDetailesTypes;
    availabilityStatus:boolean;
    rating:number;
    location:LocationTypes;
    createdAt:Date;
    updatedAt:Date;
    generateToken:(driverID:mongoose.Schema.Types.ObjectId) => Promise<string>;
}
export interface DriverTypesPopulated extends Pick<DriverTypes, "_id"|"licenseNumber"|"vehicleDetailes"|"availabilityStatus"|"rating"|"location"|"createdAt"|"updatedAt"|"generateToken"> {
    userID:Pick<UserTypes, "_id"|"name"|"email"|"gender"|"mobile"|"role"|"socketID">;
    image?:string;
}
// driver register request types
export type DriverRegisterFormTypes = VehicleDetailesTypes & Pick<UserTypes, "password"> & Pick<DriverTypes, "licenseNumber">;
// driver login request types
export type DriverLoginFormTypes = Pick<UserTypes, "email"|"password"> & Pick<DriverRegisterFormTypes, "licenseNumber"|"vehicleNumber">;
//update my driver profile form types
export type UpdateMyDriverProfileFormTypes = Partial<Pick<DriverTypes, "licenseNumber"|"availabilityStatus">> & Partial<VehicleDetailesTypes>;
//
export interface GetAllDriversQueryTypes {
    rating?:string;
    availabilityStatus?:string;
    fromDate?:string;
    upToDate?:string;
};


// ****** RIDE RELATED TYPES ******
export type RideStatusTypes = "requested"|"accepted"|"in-progress"|"completed"|"cancelled";
export interface RideLocationTypes {
    latitude:number;
    longitude:number;
    address:string;
};
export interface RideTypes {
    _id:mongoose.Schema.Types.ObjectId;
    driverID:mongoose.Schema.Types.ObjectId;
    passengerID:mongoose.Schema.Types.ObjectId;
    pickupLocation:LocationTypes;
    dropoffLocation:LocationTypes;
    distance:number;
    fare:number;
    duration:number;
    status:RideStatusTypes;
    paymentID:string;
    orderID:string;
    signature:string;
    otp:string;
    createdAt:Date;
    updatedAt:Date;
};
export interface RideTypesPopulated extends Pick<RideTypes, "_id"|"pickupLocation"|"dropoffLocation"|"distance"|"fare"|"duration"|"status"|"paymentID"|"orderID"|"signature"|"otp"|"createdAt"|"updatedAt"> {
    driverID:DriverTypes;
    passengerID:UserTypes;
};
// create ride request types
export interface CreateRideRequestFormTypes{
    passengerID:mongoose.Schema.Types.ObjectId;
    pickupLocation:RideLocationTypes;
    dropoffLocation:RideLocationTypes;
    vehicleType:VehicleTypeTypes;
};
// accept ride request types
export interface AcceptRideRequestFormTypes extends Pick<RideTypes, "status">{   
    rideID:mongoose.Schema.Types.ObjectId;
};
// start ride request types
export interface StartRideRequestFormTypes extends Pick<RideTypes, "otp">{   
    rideID:mongoose.Schema.Types.ObjectId;
};
// get all rides query types
export interface GetAllRidesQueryTypes extends Pick<RideTypes, "driverID"|"status">{
    pickUpLatitude?:string;
    pickUpLongitude?:string;
    dropoffLatitude?:string;
    dropoffLongitude?:string;
    startDate?:string;
    endDate?:string;
};


// ****** REVIEW RELATED TYPES ******
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
export type FindDriverAllReviewsQueryTypes = Partial<Pick<ReviewTypes, "driverID"|"rideID">>;
export interface CreateReviewFormTypes extends Partial<Pick<ReviewTypes, "driverID"|"rideID"|"rating">>{
    comment?:string;
};


// ****** CHAT RELATED TYPES ******
export interface ChatTypes{
    sender:mongoose.Schema.Types.ObjectId;
    receiver:mongoose.Schema.Types.ObjectId;
    content:string;
    createdAt:Date;
};
// create chat request types
export interface CreateChatFormTypes extends Pick<ChatTypes, "receiver"|"content">{
    receiverSocketID:string;
    senderType:"user"|"driver"
};
// utility types
export type GenerateTokenType = {generateToken:(userID:mongoose.Schema.Types.ObjectId) => Promise<string>};