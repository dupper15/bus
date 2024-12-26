import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY; // Sử dụng biến môi trường

// Lấy danh sách tất cả ý kiến
export const getAllOpinion = async () => {
  try {
    const response = await axios.get(`${API_KEY}/opinion/get-all`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all opinions", error);
    throw error;
  }
};

// Lấy danh sách trạng thái ý kiến
export const getAllStatus = async () => {
  try {
    const response = await axios.get(`${API_KEY}/opinion/get-status`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all statuses", error);
    throw error;
  }
};

// Lấy ý kiến đã được giải quyết
export const resolvedOpinion = async (data) => {
  try {
    const response = await axios.put(`${API_KEY}/opinion/resolve`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to get resolved opinions", error);
    throw error;
  }
};
