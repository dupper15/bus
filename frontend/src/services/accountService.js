import axios from "axios";
export const axiosJWT = axios.create();

const API_KEY = import.meta.env.VITE_API_KEY;
export const loginAccount = async (data) => {
  try {
    const response = await axios.post(`${API_KEY}/account/log-in`, data);
    console.log("test2", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const getDetailAccount = async (id, access_token) => {
  try {
    console.log("data service", id, access_token);
    const response = await axiosJWT.get(`${API_KEY}/account/get-detail/${id}`, {
      headers: {
        token: `Bearer ${access_token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const updateAccount = async (data) => {
  try {
    const response = await axios.put(`${API_KEY}/account/update`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const refreshTokenJwt = async () => {
  try {
    const response = await axios.post(`${API_KEY}/account/refresh-token`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const logoutAccount = async () => {
  try {
    const response = await axios.post(`${API_KEY}/account/log-out`);
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await axios.put(
      `${API_KEY}/account/change-password`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get detail", error);
    throw error;
  }
};

export const getAllAccounts = async (data) => {
  try {
    const response = await axios.get(`${API_KEY}/account/get-all`, {
      params: { type: data },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get all accounts", error);
    throw error;
  }
};
