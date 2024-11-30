import { CookieOptions } from "express";

export const cookieOptions:CookieOptions = {httpOnly:true, secure:true, sameSite:"none", maxAge:1000*60*60*4};