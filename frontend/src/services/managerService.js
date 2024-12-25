import axios from "axios"
export const getAllManager = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/manager/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
  };

export const deleteManager = async (data) => {
    try {
      const response = await axios.delete(
        "http://localhost:3001/api/manager/delete", data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
};
