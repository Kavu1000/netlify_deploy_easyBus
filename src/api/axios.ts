import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'https://bus-api.nkaujntseeg.com/api', // Use custom domain backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
