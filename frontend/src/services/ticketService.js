import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY; // Sử dụng biến môi trường

// Lấy tất cả vé
export const getAllTicket = async () => {
  try {
    const response = await axios.get(`${API_KEY}/ticket/get-all`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all tickets", error);
    throw error;
  }
};

// Tạo vé mới
export const createTicket = async (data) => {
  try {
    console.log("data", data);
    const response = await axios.post(`${API_KEY}/ticket/create`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to create ticket", error);
    throw error;
  }
};


