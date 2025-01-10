import mongoose, { Model } from "mongoose";
import { ChatTypes } from "../utils/types.js";



const chatSchema = new mongoose.Schema<ChatTypes>({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true,
        maxlength:[20, "Chat content length should be less than 100 words"]
    }
}, {timestamps:true});

const chatModel:Model<ChatTypes> = mongoose.models.Chat || mongoose.model<ChatTypes>("Chat", chatSchema);

export default chatModel;