import axios from './root.service.js';
import { formatUserData } from '@helpers/formatData.js';

export async function getUsers() {
    try {
        const { data } = await axios.get('/user/');
        const formattedData = data.data.map(formatUserData);
        return formattedData;
    } catch (error) {
        return error.response.data;
    }
}

export async function updateUser(data, email) {
    try {
        const response = await axios.patch(`/user/detail/?email=${email}`, data);
        console.log(response);
        return response.data.data;
    } catch (error) {
        console.log(error);
        return error.response.data;
    }
}

export async function deleteUser(email) {
    try {
        const response = await axios.delete(`/user/detail/?email=${email}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}