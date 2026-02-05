import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// Base configuration
const API_BASE = 'https://rrhhmod-backend.rchavezza.workers.dev/api/v1'
const api: AxiosInstance = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.companyId) {
                config.headers['X-Tenant-ID'] = user.companyId;
            } else {
                config.headers['X-Tenant-ID'] = 'comp-default';
            }
        } catch (e) {
            config.headers['X-Tenant-ID'] = 'comp-default';
        }
    } else {
        config.headers['X-Tenant-ID'] = 'comp-default';
    }
    
    return config;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use((response) => {
    return response;
}, async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        // Clear session
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    // Handle 403 Forbidden (Permission denied)
    if (error.response?.status === 403) {
        console.warn('Access denied:', error.response.data);
        // Optional: Trigger a global notification here via a dedicated event bus or store if available
    }

    return Promise.reject(error);
});

export { api };
export default api;
