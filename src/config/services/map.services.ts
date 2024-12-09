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