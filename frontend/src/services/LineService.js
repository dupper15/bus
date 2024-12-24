import axios from 'axios';

const LineService = {
    getLines: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_KEY}/line/get-all`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch bus lines:", error);
            throw error;
        }
    },
    getLineDetails: async (lineId) => {
        try {
            const response = await axios.get(`/api/line/get-detail/${lineId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch line details:", error);
            throw error;
        }
    }
}

export default LineService;