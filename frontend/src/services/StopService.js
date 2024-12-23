import axios from 'axios';

const StopService = {
    getStops: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_KEY}/stop/get-all`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch stops:", error);
            throw error;
        }
    },
    getStopDetail: async (stopId) => {
        try {
            const response = await axios.get(`/api/stop/get-detail/${stopId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch stop details:", error);
            throw error;
        }
    }
}

export default StopService;