import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15 second timeout for all requests
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Request interceptor — attach JWT to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor — handle auth errors and common failures
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Clear stale token and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response.status === 429) {
                console.error("Rate limit exceeded. Please slow down.");
            } else if (error.response.status === 500) {
                console.error("Server error. Please try again later.");
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error("Request timed out. Please check your connection.");
        } else if (!error.response) {
            console.error("Network error. Please check your internet connection.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;