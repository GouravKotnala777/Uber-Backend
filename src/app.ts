import { config } from "dotenv";
import express from "express";
import http from "http";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import driverRouter from "./routes/driverRouter.js";
import cookieParser from "cookie-parser";
import rideRouter from "./routes/rideRouter.js";
import mapsRouter from "./routes/mapRouter.js";
import cors from "cors";
import { initializeSocket } from "./socket.js";
import chatRouter from "./routes/chatRouter.js";

// Dotenv configuration
config({
    path:"./.env"
});



const app = express();
const server  = http.createServer(app);
const PORT = process.env.PORT || 8000;

// Database connection
connectDB();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(cors({
    origin:[
        process.env.CLIENT_URL as string,
        process.env.CLIENT_URL2 as string,
        process.env.CLIENT_URL3 as string
    ],
    methods:["GET", "POST"],
    credentials:true
}));



// All endpoints
app.use("/api/v1/user", userRouter);
app.use("/api/v1/driver", driverRouter);
app.use("/api/v1/ride", rideRouter);
app.use("/api/v1/map", mapsRouter);
app.use("/api/v1/chat", chatRouter);


// endpoint for testing
app.route("/api/v1/testing").get((req, res, next) => {
    res.status(200).json({success:true, message:"getting endpoint from /testing"});
});

app.use(errorMiddleware);


initializeSocket(server);


// Server listener
server.listen(PORT, () => {
    console.log("listening....");
});