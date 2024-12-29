import axios from 'axios';

const StopService = {
    createStop: async (stop) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_KEY}/stop/create`, stop);
            return response.data;
        } catch (error) {
            console.error("Failed to create stop:", error);
            throw error;
        }
    },
    updateStop: async (stopId, stop) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_KEY}/stop/update/${stopId}`, stop);
            return response.data;
        } catch (error) {
            console.error("Failed to update stop:", error);
            throw error;
        }
    },
    deleteStop: async (stopId) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_KEY}/stop/delete/${stopId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete stop:", error);
            throw error;
        }
    },
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