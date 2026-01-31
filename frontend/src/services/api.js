import axios from 'axios';
import { useAuthStore } from '@/store/auth';
// Configuración base de Axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://proyectorrhh.rchavezza.workers.dev/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Interceptor para añadir token de autorización
api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Interceptor para manejar respuestas y refrescar token
api.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;
    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const authStore = useAuthStore();
        try {
            // Intentar refrescar el token
            const refreshed = await authStore.refreshAccessToken();
            if (refreshed) {
                // Reintentar la petición original con el nuevo token
                originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
                return api(originalRequest);
            }
        }
        catch (refreshError) {
            // Si no se puede refrescar, cerrar sesión
            authStore.logout();
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
export { api as default };
export { api };
