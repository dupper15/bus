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
export const deleteEmployee = async (data) => {
  try {
    console.log(data);
    const response = await axios.delete(
      `http://localhost:3001/api/employee/delete/${data}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};
