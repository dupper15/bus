import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY; // Sử dụng biến môi trường

export const getAllAdd = async () => {
  try {
    const response = await axios.get(`${API_KEY}/schedule/get-all-add`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all schedule", error);
    throw error;
  }
};

export const getAllSchedule = async () => {
    try {
      const response = await axios.get(`${API_KEY}/schedule/get-all`);
      return response.data;
    } catch (error) {
      console.error("Failed to get all schedules", error);
      throw error;
    }
  };

export const createSchedule = async (data) => {
    try {
      const response = await axios.post(`${API_KEY}/schedule/create`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to create schedule", error);
      throw error;
    }
};

export const editSchedule = async (data) => {
    try {
      const response = await axios.put(`${API_KEY}/schedule/edit`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to edit schedule", error);
      throw error;
    }
};

export const deleteSchedule = async (id) => {
    try {
      const response = await axios.delete(`${API_KEY}/schedule/delete/${id}` );
      return response.data;
    } catch (error) {
      console.error("Failed to edit schedule", error);
      throw error;
    }
};