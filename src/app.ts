import { config } from "dotenv";
import express from "express";
import http from "http";
import mainRouter from "./server.js";


config({
    path:"./.env"
});



const app = express();
const server  = http.createServer(app);
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({extended:true}));

app.use("/api/v1", mainRouter);

app.route("/api/v1/testing").get((req, res, next) => {
    res.status(200).json({success:true, message:"getting endpoint from /testing"});
})

server.listen(PORT, () => {
    console.log("listening....");
});