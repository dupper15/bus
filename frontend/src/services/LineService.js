import axios from 'axios';

const LineService = {
    createLine: async (line) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_KEY}/line/create`, line);
            return response.data;
        } catch (error) {
            console.error("Failed to create line:", error);
            throw error;
        }
    },
    updateLine: async (lineId, line) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_KEY}/line/update/${lineId}`, line);
            return response.data;
        } catch (error) {
            console.error("Failed to update line:", error);
            throw error;
        }
    },
    deleteLine: async (lineId) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_KEY}/line/delete/${lineId}`);
            return response.data;
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
            const response = await axios.get(`${import.meta.env.VITE_API_KEY}/line/get-detail/${lineId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch line details:", error);
            throw error;
        }
    },
}

export default LineService;

export const getAllSchedule = async (lineId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_KEY}/line/get-all-schedule/${lineId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to create customer", error);
      throw error;
    }
  };