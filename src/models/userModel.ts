import mongoose, { Model } from "mongoose";

export interface UserTypes {
    name:string;
    email:string;
    password:string;
    mobile:string;
    gender:"male"|"female"|"other";
}

const userSchema = new mongoose.Schema<UserTypes>({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    mobile:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:["male", "female", "other"]
    }
});

const userModel:Model<UserTypes> = mongoose.models.UserTypes || mongoose.model<UserTypes>("User", userSchema);

export default userModel;