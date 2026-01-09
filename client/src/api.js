import axios from 'axios';

// Dynamically determine API URL based on current hostname
// This allows the app to work on localhost AND from other devices on the network
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    const port = 5000;
    return `http://${hostname}:${port}/api`;
};

// Create axios instance with dynamic base URL
const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
