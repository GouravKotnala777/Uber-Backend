import { IncomingMessage, Server as HTTPSERVER, ServerResponse } from "http";
import {DefaultEventsMap, Server} from "socket.io";
import User from "./models/userModel.js";
import Driver from "./models/driverModel.js";
import { ErrorHandler } from "./utils/utilityClasses.js";
import { DISCONNECT, JOIN, NEW_CONNECTION, UPDATE_DRIVER_LOCATION } from "./utils/constants.js";

let io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>|null;

export const initializeSocket = (server:HTTPSERVER<typeof IncomingMessage, typeof ServerResponse>) => {
    io = new Server(server, {
        cors:{
            origin:[
                process.env.CLIENT_URL as string,
                process.env.CLIENT_URL2 as string,
                process.env.CLIENT_URL3 as string
            ],
            methods:["GET", "POST"],
            credentials:true
        }
    });

    io.on(NEW_CONNECTION, (socket) => {
        console.log(`client connected ${socket.id}`);

        socket.on(JOIN, async({userID, userType}:{userID:string; userType:"user"|"driver"|"admin";}) => {            
            console.log(`${userID} joined as ${userType}`);
            
            if (userType === "user") {
                await User.findByIdAndUpdate(userID, {
                    socketID:socket.id
                });
            }
            else if (userType === "driver") {
                await User.findByIdAndUpdate(userID, {
                    socketID:socket.id
                });
            }
        });

        socket.on(UPDATE_DRIVER_LOCATION, async(data:{
            message:{
                passengerSocketID:string;
                driverID:string;
                eventName:string;
                location:{ltd:number; lng:number;}};
        }) => {
            console.log("FFFFFFFFFFFFFFFFFFFFFFFF");
            console.log(data);
            
            const {driverID, location, eventName, passengerSocketID} = data.message;
            if (!location || !location.ltd || !location.lng) return socket.emit("error", {message:"Invalid location data"});

            
            // ---------------------------------------------------------------await Driver.findByIdAndUpdate(driverID, {
            // --------------------------------------------------------------------------------   location
            //});
            io?.to(passengerSocketID).emit(eventName, {driverID, location});
        });

        socket.on(DISCONNECT, () => {
            console.log(`client disconnected ${socket.id}`);
        });
    });
};

export const sendMessageToSocketId = ({socketID, eventName, message}:{socketID:string; eventName:string; message:string|Record<string, unknown>;}) => {
    if (io) {
        //console.log({socketID, eventName, message});
        io.to(socketID).emit(eventName, message);
    }
    else{
        console.log(`socket.io not initialized`);
    }
};