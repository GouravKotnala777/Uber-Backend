import axios from "axios";
import { ErrorHandler } from "../../utils/utilityClasses.js";

interface ApifyDistanceTimeResponseType{
    features:{
      properties: {
        mode:string,
        units:string,
        distance:number,
        distance_units:string,
        time:number,
      }
    }[]
}

export const getAddressCoordinate = async(address:string) => {
    const mapApiKey = process.env.VITE_GO_MAPS_API_KEY as string;
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

    const GEOAPIFY_PLACES_API_KEY = process.env.GEOAPIFY_PLACES_API_KEY as string;
    //const mapApiKey = process.env.VITE_GO_MAPS_API_KEY as string;
    const url = `https://api.geoapify.com/v1/routing?waypoints=${origin}|${destination}&mode=drive&apiKey=${GEOAPIFY_PLACES_API_KEY}`;
    //const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${mapApiKey}`;

    try {
        const response = await fetch(url);
        const data:ApifyDistanceTimeResponseType = await response.json();

        console.log("::::::::::::::: 1");
        console.log(data);        
        console.log("::::::::::::::: 2");
        

        if (response.ok) {
            if (data.features.length === 0) throw new ErrorHandler("No routes found", 404);
            return data.features[0].properties;
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

    const GEOAPIFY_PLACES_API_KEY = process.env.GEOAPIFY_PLACES_API_KEY as string;
    //const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY as string;
    //const mapApiKey = process.env.GO_MAPS_API_KEY as string;
    
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&apiKey=${GEOAPIFY_PLACES_API_KEY}`;
    //const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_PLACES_API_KEY}`;
    //const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${mapApiKey}`;
    console.log({input, GEOAPIFY_PLACES_API_KEY});
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.text(); 
            console.error(`GoMaps Error Status: ${response.status}`);
            console.error(`GoMaps Error Body: ${errorBody}`);
            
            throw new ErrorHandler(`Upstream API Error: ${response.status}`, response.status);
        }

        const data = await response.json();
        console.log(data);        
        return data;

    } catch (error) {
        console.error("Internal Catch:", error);
        if (error instanceof ErrorHandler) throw error;
        throw new ErrorHandler((error as Error).message, 500);
    }

};