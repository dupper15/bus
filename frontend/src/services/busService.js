import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

// Tạo mới xe buýt
export const createBus = async (data) => {
  try {
    const response = await axios.post(
      `${API_KEY}/bus/create`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create bus", error);
    throw error;
  }
};

// Lấy danh sách tất cả xe buýt
export const getAllBus = async () => {
  try {
    const response = await axios.get(
      `${API_KEY}/bus/get-all` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get all buses", error);
    throw error;
  }
};

// Xóa xe buýt
export const deleteBus = async (data) => {
  try {
    const response = await axios.delete(
      `${API_KEY}/bus/delete`, // Sử dụng biến môi trường
      data  // Truyền data thông qua body
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete bus", error);
    throw error;
  }
};

// Chỉnh sửa thông tin xe buýt
export const editBus = async (data) => {
  try {
    const response = await axios.put(
      `${API_KEY}/bus/edit`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to edit bus", error);
    throw error;
  }
};
