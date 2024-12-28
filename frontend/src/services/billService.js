import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

export const createBill = async (data) => {
  try {
    console.log("data", data);
    const response = await axios.post(
      `${API_KEY}/bill/create`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create bill", error);
    throw error;
  }
};

export const getAllBill = async () => {
  try {
    const response = await axios.get(
      `${API_KEY}/bill/get-all` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get all bills", error);
    throw error;
  }
};

export const getDetailBill = async (id) => {
    try {
      const response = await axios.get(
        `${API_KEY}/bill/get-detail/${id}` // Sử dụng biến môi trường
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail bills", error);
      throw error;
    }
  };

export const deleteBill = async (data) => {
  try {
    const response = await axios.delete(
      `${API_KEY}/bill/delete`, // Sử dụng biến môi trường
      data  // Truyền data thông qua body
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete bill", error);
    throw error;
  }
};

export const editBill = async (data) => {
  try {
    const response = await axios.put(
      `${API_KEY}/bill/edit`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to edit bill", error);
    throw error;
  }
};


