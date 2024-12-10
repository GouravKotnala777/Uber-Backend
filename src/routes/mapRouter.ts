import express from "express";
import { isUserAuthenticated } from "../middlewares/auth.js";
import { getCoordinates, getDistance, getSuggestions } from "../controllers/mapController.js";


const mapsRouter = express.Router();

mapsRouter.get("/get-coordinates", getCoordinates);
mapsRouter.get("/get-distance-time", getDistance);
mapsRouter.get("/get-suggestions", getSuggestions);

export default mapsRouter;