import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;
export const getSumary = async () => {
  try {
    const response = await axios.get(`${API_KEY}/dashboard/get-sumary`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all customers", error);
    throw error;
  }
};
