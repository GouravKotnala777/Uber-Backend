import { CookieOptions } from "express";

export const PORT = process.env.PORT || 8000;
export const USER_TOKEN_NAME = "userToken";
export const DRIVER_TOKEN_NAME = "driverToken";
export const cookieOptions:CookieOptions = {httpOnly:true, secure:true, sameSite:"none", maxAge:1000*60*60*4};

export const baseFare = {
    uberAuto: 30,
    uberX: 50,
    uberScooty: 20,
    uberMoto: 25,
    uberComfort: 70,
    uberHCV: 100,
    uberPool: 40,
    uberXL: 80,
};

export const perKmRate = {
    uberAuto: 10,
    uberX: 15,
    uberScooty: 8,
    uberMoto: 9,
    uberComfort: 20,
    uberHCV: 25,
    uberPool: 7,
    uberXL: 18,
};

export const perMinuteRate = {
    uberAuto: 2,
    uberX: 3,
    uberScooty: 1.5,
    uberMoto: 1.8,
    uberComfort: 4,
    uberHCV: 5,
    uberPool: 1.2,
    uberXL: 3.5,
};

// socket events name
export const NEW_CONNECTION = "connection";
export const JOIN = "join";
export const UPDATE_DRIVER_LOCATION = "update-driver-location";
export const NEW_RIDE = "new-ride";
export const RIDE_ACCEPTED = "ride-accepted";
export const RIDE_STARTED = "ride-started";
export const RIDE_ENDED = "ride-ended";
export const RIDE_CANCELLED = "ride-cancelled";
export const NEW_MESSAGE = "new-message";
export const DISCONNECT = "disconnect";