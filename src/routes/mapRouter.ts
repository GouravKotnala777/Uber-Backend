import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { getCoordinates } from "../controllers/mapController.js";


const mapsRouter = express.Router();

mapsRouter.get("/get-coordinates", getCoordinates);

export default mapsRouter;