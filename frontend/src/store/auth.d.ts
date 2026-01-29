import type { LoginCredentials } from '@/types/auth.types';
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", Pick<{
    user: any;
    accessToken: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => void;
    refreshAccessToken: () => Promise<boolean>;
    toggleDarkMode: () => void;
    init: () => void;
}, any>, Pick<{
    user: any;
    accessToken: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => void;
    refreshAccessToken: () => Promise<boolean>;
    toggleDarkMode: () => void;
    init: () => void;
}, any>, Pick<{
    user: any;
    accessToken: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => void;
    refreshAccessToken: () => Promise<boolean>;
    toggleDarkMode: () => void;
    init: () => void;
}, any>>;
