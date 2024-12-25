import axios from "axios";
export const getAllTicket = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/ticket/get-all"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
export const createTicket = async (data) => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/ticket/create",data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
  };