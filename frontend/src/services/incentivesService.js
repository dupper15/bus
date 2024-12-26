import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

export const createIncentives = async (data) => {
  try {
    const response = await axios.post(
      `${API_KEY}/incentives/create`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create incentives", error);
    throw error;
  }
};

export const getAllIncentives = async () => {
  try {
    const response = await axios.get(
      `${API_KEY}/incentives/get-all` // Sử dụng biến môi trường
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get all incentives", error);
    throw error;
  }
};

export const deleteIncentives = async (data) => {
  try {
    const response = await axios.delete(
      `${API_KEY}/incentives/delete`, // Sử dụng biến môi trường
      data  // Truyền data thông qua body
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete incentives", error);
    throw error;
  }
};

export const editIncentives = async (data) => {
  try {
    const response = await axios.put(
      `${API_KEY}/incentives/edit`, // Sử dụng biến môi trường
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to edit incentives", error);
    throw error;
  }
};
