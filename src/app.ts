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

// Dotenv configuration
config({
    path:"./.env"
});



const app = express();
const server  = http.createServer(app);
const PORT = process.env.PORT || 8000;

// Database connection
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// All endpoints
app.use("/api/v1/user", userRouter);
app.use("/api/v1/driver", driverRouter);
app.use("/api/v1/ride", rideRouter);
app.use("/api/v1/map", mapsRouter);


// endpoint for testing
app.route("/api/v1/testing").get((req, res, next) => {
    res.status(200).json({success:true, message:"getting endpoint from /testing"});
});

app.use(errorMiddleware);


// Server listener
server.listen(PORT, () => {
    console.log("listening....");
});