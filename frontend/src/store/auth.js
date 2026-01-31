import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const accessToken = ref(null);
    const refreshToken = ref(null);
    const isDarkMode = ref(false);

    const isAuthenticated = computed(() => !!accessToken.value);

    const login = async (credentials) => {
        return true;
    };

    const logout = () => {
        user.value = null;
        accessToken.value = null;
        refreshToken.value = null;
    };

    const checkAuth = () => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            accessToken.value = storedToken;
            user.value = JSON.parse(storedUser);
        }
    };

    const refreshAccessToken = async () => {
        return false;
    };

    const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    const init = () => {
        checkAuth();
        const storedDarkMode = localStorage.getItem('dark_mode');
        isDarkMode.value = storedDarkMode === 'true';
    };

    return {
        user,
        accessToken,
        refreshToken,
        isDarkMode,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        refreshAccessToken,
        toggleDarkMode,
        init
    };
});
