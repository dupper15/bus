import axios from 'axios';

export const loginUser = async (data) => {
    try {
        const response = await axios.post('http://localhost:3001/api/customer/log-in', data);
        return response.data;
    } catch (error) {
        console.error('Failed to log in:', error);
        throw error;
    }
};

export const getUserDetails = async (customerId, accessToken) => {
    try {
        const response = await axios.get(`http://localhost:3001/api/customer/get-detail/${customerId}`, {
            headers: {
                Token: `${accessToken}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user details:', error);
        throw error;
    }
};

export const resetPassword = async (email) => {
    try {
        const response = await axios.post('http://localhost:3001/api/customer/reset-password', { email });
        return response.data;
    } catch (error) {
        console.error('Failed to reset password:', error);
        throw error;
    }
};

export const signUpUser = async (data) => {
    try {
        console.log(data);
        const response = await axios.post('http://localhost:3001/api/customer/sign-up', data);
        return response.data;
    } catch (error) {
        console.error('Failed to sign up:', error);
        throw error;
    }
};