import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
export const usePayrollStore = defineStore('payroll', () => {
    // State
    const payrollList = ref([]);
    const currentPayroll = ref(null);
    const loading = ref(false);
    const error = ref(null);
    // Actions
    const fetchPayrollList = async (filters) => {
        loading.value = true;
        error.value = null;
        try {
            const params = new URLSearchParams();
            if (filters?.period)
                params.append('period', filters.period);
            if (filters?.employeeId)
                params.append('employeeId', filters.employeeId);
            if (filters?.estado)
                params.append('estado', filters.estado);
            const response = await api.get(`/payroll?${params.toString()}`);
            payrollList.value = response.data.data;
        }
        catch (err) {
            error.value = err.message || 'Error al cargar planilla';
            console.error('Error fetching payroll:', err);
        }
        finally {
            loading.value = false;
        }
    };
    const generatePayroll = async (period, employeeIds) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.post('/payroll/generate', {
                period,
                employeeIds
            });
            return response.data.data;
        }
        catch (err) {
            error.value = err.message || 'Error al generar planilla';
            console.error('Error generating payroll:', err);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };
    const exportPayrollExcel = async (period, employeeIds) => {
        loading.value = true;
        error.value = null;
        try {
            const params = new URLSearchParams();
            params.append('period', period);
            if (employeeIds?.length) {
                params.append('employeeIds', employeeIds.join(','));
            }
            const response = await api.get(`/payroll/export/excel?${params.toString()}`, {
                responseType: 'blob'
            });
            // Crear URL y descargar archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `planilla_${period}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return true;
        }
        catch (err) {
            error.value = err.message || 'Error al exportar planilla';
            console.error('Error exporting payroll:', err);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };
    const approvePayroll = async (payrollIds) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.post('/payroll/approve', {
                payrollIds
            });
            return response.data.data;
        }
        catch (err) {
            error.value = err.message || 'Error al aprobar planilla';
            console.error('Error approving payroll:', err);
            throw err;
        }
        finally {
            loading.value = false;
        }
    };
    const clearCurrentPayroll = () => {
        currentPayroll.value = null;
    };
    return {
        // State
        payrollList,
        currentPayroll,
        loading,
        error,
        // Actions
        fetchPayrollList,
        generatePayroll,
        exportPayrollExcel,
        approvePayroll,
        clearCurrentPayroll
    };
});
