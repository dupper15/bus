import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

// Lấy danh sách tất cả khách hàng
export const getAllCustomer = async () => {
  try {
    const response = await axios.get(
      `${API_KEY}/customer/get-all` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get all customers", error);
    throw error;
  }
};

// Tạo mới khách hàng
export const createCustomer = async (data) => {
  try {
    const response = await axios.post(
      `${API_KEY}/customer/sign-up`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create customer", error);
    throw error;
  }
};

// Xóa khách hàng
export const deleteCustomer = async (id) => {
  try {
    const response = await axios.delete(
      `${API_KEY}/customer/delete/${id}` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete customer", error);
    throw error;
  }
};

// Thay đổi trạng thái khách hàng
export const changeStatus = async (id) => {
  try {
    const response = await axios.put(
      `${API_KEY}/customer/change-status/${id}` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to change customer status", error);
    throw error;
  }
};
