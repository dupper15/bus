import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

// Lấy danh sách tất cả nhân viên
export const getAllEmployee = async () => {
  try {
    const response = await axios.get(
      `${API_KEY}/employee/get-all` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get all employees", error);
    throw error;
  }
};

// Thêm mới nhân viên
export const addEmployee = async (data) => {
  try {
    const response = await axios.post(
      `${API_KEY}/employee/create`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add employee", error);
    throw error;
  }
};

// Xóa nhân viên
export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(
      `${API_KEY}/employee/delete/${id}` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete employee", error);
    throw error;
  }
};

// Chỉnh sửa thông tin nhân viên
export const editEmployee = async (id, data) => {
  try {
    const response = await axios.put(
      `${API_KEY}/employee/edit/${id}`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to edit employee", error);
    throw error;
  }
};

// Thay đổi trạng thái nhân viên
export const changeStatus = async (id) => {
  try {
    const response = await axios.put(
      `${API_KEY}/employee/change-status/${id}` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to change employee status", error);
    throw error;
  }
};
