import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY; // Sử dụng biến môi trường

// Lấy danh sách tất cả quản lý
export const getAllManager = async () => {
  try {
    const response = await axios.get(`${API_KEY}/manager/get-all`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all managers", error);
    throw error;
  }
};

// Xóa quản lý
export const deleteManager = async (data) => {
  try {
    const response = await axios.delete(`${API_KEY}/manager/delete`, 
      data, // Gửi dữ liệu trong body của request
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete manager", error);
    throw error;
  }
};

export const updateManager = async (data) => {
  try {
    const response = await axios.put(`${API_KEY}/manager/edit`,
      data, // Gửi dữ liệu trong body của request
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete manager", error);
    throw error;
  }
};
