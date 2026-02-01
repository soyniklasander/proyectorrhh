import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth';

// Configuración base de Axios
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://proyectorrhh.rchavezza.workers.dev/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir token de autorización
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Need to defer accessing store to avoid circular dependency if store uses api?
    // In Pinia, it's usually fine if called inside interceptor (runtime).
    // But be careful.
    // Ideally pass token manually or access store instance here.
    // Pinia store should be used inside functions.
    // However, `useAuthStore()` requires active Pinia instance.
    // If api.ts is imported before main.ts runs, `useAuthStore()` might fail.
    // But interceptor runs later.

    // To be safe, we can check if pinia is active, but usually this works in Vue 3 apps.
    // If it fails, we can use a getter or simple localStorage for the token here.

    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

// Interceptor para manejar respuestas y refrescar token
api.interceptors.response.use((response) => {
    return response;
}, async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        // Handle logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';

        // Refresh logic would go here
    }
    return Promise.reject(error);
});

export { api as default };
export { api };
