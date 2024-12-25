import axios from "axios";
export const getAllOpinion = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/opinion/get-all"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
export const getAllStatus = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/opinion/get-status"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const resolvedOpinion = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/opinion/get-status"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};