import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null);
    const accessToken = ref(null);
    const refreshToken = ref(null);
    const isDarkMode = ref(false);
    // Getters
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
    // Actions
    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { access_token, refresh_token, user: userData } = response.data.data;
            accessToken.value = access_token;
            refreshToken.value = refresh_token;
            user.value = userData;
            // Guardar en localStorage
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        }
        catch (error) {
            console.error('Error en login:', error);
            return false;
        }
    };
    const logout = () => {
        user.value = null;
        accessToken.value = null;
        refreshToken.value = null;
        // Limpiar localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    };
    const checkAuth = () => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            accessToken.value = storedToken;
            user.value = JSON.parse(storedUser);
            refreshToken.value = localStorage.getItem('refresh_token');
        }
    };
    const refreshAccessToken = async () => {
        try {
            if (!refreshToken.value) {
                throw new Error('No hay refresh token');
            }
            const response = await api.post('/auth/refresh', {
                refreshToken: refreshToken.value
            });
            const { access_token } = response.data.data;
            accessToken.value = access_token;
            localStorage.setItem('access_token', access_token);
            return true;
        }
        catch (error) {
            console.error('Error refrescando token:', error);
            logout();
            return false;
        }
    };
    const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
        localStorage.setItem('dark_mode', String(isDarkMode.value));
    };
    // Inicializar estado
    const init = () => {
        checkAuth();
        const storedDarkMode = localStorage.getItem('dark_mode');
        isDarkMode.value = storedDarkMode === 'true';
    };
    return {
        // State
        user,
        accessToken,
        refreshToken,
        isDarkMode,
        // Getters
        isAuthenticated,
        // Actions
        login,
        logout,
        checkAuth,
        refreshAccessToken,
        toggleDarkMode,
        init
    };
});
