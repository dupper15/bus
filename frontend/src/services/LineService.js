import axios from 'axios';

const LineService = {
    createLine: async (line) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_KEY}/line/create`, line);
        } catch (error) {
            console.error("Failed to create line:", error);
            throw error;
        }
    },
    updateLine: async (lineId, line) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_KEY}/line/update/${lineId}`, line);
        } catch (error) {
            console.error("Failed to update line:", error);
            throw error;
        }
    },
    deleteLine: async (lineId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_KEY}/line/delete/${lineId}`);
        } catch (error) {
            console.error("Failed to delete line:", error);
            throw error;
        }
    },
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