import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export interface Settings {
    ruc: string;
    razonSocial: string;
    direccionFiscal: {
        direccion: string;
        distrito?: string;
        provincia?: string;
        departamento?: string;
    };
    representanteLegal: {
        nombre: string;
        dni: string;
    };
    config: {
        logoUrl?: string;
        firmaUrl?: string;
        theme?: 'light' | 'dark';
        payroll?: {
            uit: number;
            rmv: number;
            currency: 'PEN' | 'USD';
        };
    };
}

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchSettings = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.get('/settings');
            if (response.data.success) {
                settings.value = response.data.data;
            } else {
                error.value = response.data.error || 'Error fetching settings';
            }
        } catch (err: any) {
            error.value = err.message || 'Network error';
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const updateSettings = async (data: Settings) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.put('/settings', data);
            if (response.data.success) {
                settings.value = response.data.data;
                return true;
            } else {
                error.value = response.data.error || 'Error updating settings';
                return false;
            }
        } catch (err: any) {
            error.value = err.message || 'Network error';
            console.error(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        settings,
        loading,
        error,
        fetchSettings,
        updateSettings
    };
});
