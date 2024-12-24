import axios from "axios";

export const createBus = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/bus/create", data
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get detail", error);
      throw error;
    }
};

export const getAllBus = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/bus/get-all", 
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const deleteBus = async (data) => {
  try {
    const response = await axios.delete(
      "http://localhost:3001/api/bus/delete", data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const editBus = async (data) => {
  try {
    const response = await axios.put(
      "http://localhost:3001/api/bus/edit", data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};