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