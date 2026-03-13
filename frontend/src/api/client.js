import axios from 'axios';
import { auth } from '../firebase';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
});

// Attach Firebase token or Guest token to every request
client.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    const mockData = sessionStorage.getItem('mockUser');

    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    } else if (mockData) {
        // Use the hardcoded guest token for backend bypass
        config.headers.Authorization = `Bearer mock-token-admin`;
    }
    return config;
});

// Handle auth errors globally
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
