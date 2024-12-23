import axios from "axios";
export const getAllCustomer = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/customer/get-all"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
export const createCustomer = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/customer/sign-up", data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
  };
export const deleteCustomer = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/customer/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
  };
export const changeStatus = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/customer/change-status/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
  };