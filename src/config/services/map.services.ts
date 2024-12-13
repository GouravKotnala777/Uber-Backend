import axios from "axios";
import { ErrorHandler } from "../../utils/utilityClasses.js";

export const getAddressCoordinate = async(address:string) => {
    const mapApiKey = process.env.GO_MAPS_API_KEY as string;
    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapApiKey}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === "OK") {            
            const location = response.data.results[0].geometry.location;
            return {
                ltd:location.lat,
                lng:location.lng
            }
        }
        else{
            throw new ErrorHandler("Unable to fetch coordinates", 500);
        }
    } catch (error) {
        console.log(error);
        throw error;        
    }
};
export const getDistanceTime = async({origin, destination}:{origin:string; destination:string;}) => {
    if (!origin || !destination) throw new ErrorHandler("Origin and destination are required", 400);

    const mapApiKey = process.env.GO_MAPS_API_KEY as string;
    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${mapApiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === "OK") {
            if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") throw new ErrorHandler("No routes found", 404);
            return response.data.rows[0].elements[0];
        }
        else{
            throw new ErrorHandler("Unable to fetch distance and time", 500);
        }
    } catch (error) {
        console.log(error);

    }

};
export const getAutoCompleteSuggestion = async({input}:{input:string;}) => {
    if (!input) throw new ErrorHandler("Query is required", 400);

    const mapApiKey = process.env.GO_MAPS_API_KEY as string;
    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${mapApiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === "OK") {
            return response.data.predictions;
        }
        else{
            throw new ErrorHandler("Unable to fetch suggestions", 500);
        }
    } catch (error) {
        console.log(error);

    }

};