import axios from 'axios';

const API_BASE_URL = 'https://project-tempest-hiring.up.railway.app';

export const apiClient = async (path) => {
    try {
        const res = await axios.get(`${API_BASE_URL}${path}`);
        return res.data;
    } catch (err) {
        console.error('apiClient error:', err);
        throw err;
    }
};
