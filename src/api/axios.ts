import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Use local backend
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
