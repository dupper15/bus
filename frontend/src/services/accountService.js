import axios from "axios";

export const loginAccount = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/account/log-in", data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
};

