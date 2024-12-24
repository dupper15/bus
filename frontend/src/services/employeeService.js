import axios from "axios";
export const getAllEmployee = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/employee/get-all"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
export const addEmployee = async (data) => {
  try {
    console.log(data, "1");
    const response = await axios.post(
      "http://localhost:3001/api/employee/create",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(
      `http://localhost:3001/api/employee/delete/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
export const editEmployee = async (id, data) => {
  try {
    const response = await axios.put(
      `http://localhost:3001/api/employee/edit/${id}`, data
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
      `http://localhost:3001/api/employee/change-status/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
