import mongoose from "mongoose";


const connectDB = () => {
    console.log({db_url:process.env.DATABASE_URL});
    
    mongoose.connect(process.env.DATABASE_URL as string).then(() => {
        console.log("database....");
    })
    .catch((err) => {
        console.log(err);
    });
};


export default connectDB;