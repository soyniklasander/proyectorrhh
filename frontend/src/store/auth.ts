import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const accessToken = ref<string | null>(localStorage.getItem('access_token'));
    const isDarkMode = ref(localStorage.getItem('dark_mode') === 'true');

    const isAuthenticated = computed(() => !!accessToken.value);

    const checkAuth = () => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            accessToken.value = storedToken;
            try {
              user.value = JSON.parse(storedUser);
            } catch (e) {
              logout();
            }
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await api.post('/auth/login', {
              email: credentials.email,
              password: credentials.password
            });

            if (response.data.success) {
                const { token, user: userData } = response.data;
                accessToken.value = token;
                user.value = userData;

                localStorage.setItem('access_token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const logout = () => {
        user.value = null;
        accessToken.value = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
        localStorage.setItem('dark_mode', String(isDarkMode.value));
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const init = () => {
        checkAuth();
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark');
        }
    };

    return {
        user,
        accessToken,
        isDarkMode,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        toggleDarkMode,
        init
    };
});
