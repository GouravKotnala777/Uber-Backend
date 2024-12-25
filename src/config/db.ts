import mongoose from "mongoose";


const connectDB = () => {    
    mongoose.connect(process.env.DATABASE_URL as string).then(() => {
        console.log("database....");
    })
    .catch((err) => {
        console.log(err);
    });
};


export default connectDB;