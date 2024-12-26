import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY; // Sử dụng biến môi trường

export const getAllRequest = async () => {
  try {
    const response = await axios.get(`${API_KEY}/request/get-all`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all requestes", error);
    throw error;
  }
};

export const getDetailRequest = async (id) => {
    try {
      const response = await axios.get(`${API_KEY}/request/get-detail/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get all requestes", error);
      throw error;
    }
  };

export const createRequest = async (data) => {
  try {
    const response = await axios.post(`${API_KEY}/request/create`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to create request", error);
    throw error;
  }
};

export const resolvedRequest = async (data) => {
  try {
    const response = await axios.put(`${API_KEY}/request/resolve`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to get resolved requestes", error);
    throw error;
  }
};
