import { IncomingMessage, Server as HTTPSERVER, ServerResponse } from "http";
import {DefaultEventsMap, Server} from "socket.io";
import User from "./models/userModel.js";
import Driver from "./models/driverModel.js";

let io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>|null;

export const initializeSocket = (server:HTTPSERVER<typeof IncomingMessage, typeof ServerResponse>) => {
    io = new Server(server, {
        cors:{
            origin:process.env.CLIENT_URL,
            methods:["GET", "POST"],
            credentials:true
        }
    });

    io.on("connection", (socket) => {
        console.log(`client connected ${socket.id}`);

        socket.on("join", async(data:{userID:string; userType:"user"|"driver"|"admin";}) => {
            const {userID, userType} = data;

            console.log(`${userID} joined as ${userType}`);
            
            if (userType === "user") {
                await User.findByIdAndUpdate(userID, {
                    socketID:socket.id
                });
            }
            else if (userType === "driver") {
                await Driver.findByIdAndUpdate(userID, {
                    socketID:socket.id
                });
            }
        });

        socket.on("disconnect", () => {
            console.log(`client disconnected ${socket.id}`);
        });
    })
};

export const sendMessageToSocketId = ({socketID, message}:{socketID:string; message:string;}) => {
    if (io) {
        io.to(socketID).emit("message", message)
    }
    else{
        console.log(`socket.io not initialized`);
        
    }
};