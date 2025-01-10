import mongoose, { Model } from "mongoose";
import bcryptjs from "bcryptjs";
import jsonWebToken from "jsonwebtoken";
import { UserTypes } from "../utils/types.js";

const userSchema = new mongoose.Schema<UserTypes>({
    name:{
        type:String,
        required:true,
        lowercase:true
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
    },
    role:{
        type:String,
        enum:["user", "admin"],
        default:"user"
    },
    socketID:String,
    image:String
});

userSchema.pre("save", async function(next){
    if (this.isModified("password")) {
        const hashedPassword = bcryptjs.hash(this.password, 7);
        this.password = await hashedPassword;
    }
    next();
});

userSchema.methods.comparePassword = async function(password:string) {
    const isPasswordMatch = await bcryptjs.compare(password, this.password);
    return isPasswordMatch;
};

userSchema.methods.generateToken = async function(userID:mongoose.Schema.Types.ObjectId) {
    const token = await jsonWebToken.sign({_id:userID}, process.env.JWT_SECRET as string, {expiresIn:"3d"});
    return token;
};
userSchema.methods.verifyToken = async function(token:string) {
    const verifyToken = await jsonWebToken.verify(token, process.env.JWT_SECRET as string);
    return verifyToken;
};


const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;