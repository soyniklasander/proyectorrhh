import type { PayrollFilters } from '@/types/payroll.types';
export declare const usePayrollStore: import("pinia").StoreDefinition<"payroll", Pick<{
    payrollList: import("vue").Ref<any, any>;
    currentPayroll: any;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    fetchPayrollList: (filters?: PayrollFilters) => Promise<void>;
    generatePayroll: (period: string, employeeIds?: string[]) => Promise<any>;
    exportPayrollExcel: (period: string, employeeIds?: string[]) => Promise<boolean>;
    approvePayroll: (payrollIds: string[]) => Promise<any>;
    clearCurrentPayroll: () => void;
}, any>, Pick<{
    payrollList: import("vue").Ref<any, any>;
    currentPayroll: any;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    fetchPayrollList: (filters?: PayrollFilters) => Promise<void>;
    generatePayroll: (period: string, employeeIds?: string[]) => Promise<any>;
    exportPayrollExcel: (period: string, employeeIds?: string[]) => Promise<boolean>;
    approvePayroll: (payrollIds: string[]) => Promise<any>;
    clearCurrentPayroll: () => void;
}, any>, Pick<{
    payrollList: import("vue").Ref<any, any>;
    currentPayroll: any;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    fetchPayrollList: (filters?: PayrollFilters) => Promise<void>;
    generatePayroll: (period: string, employeeIds?: string[]) => Promise<any>;
    exportPayrollExcel: (period: string, employeeIds?: string[]) => Promise<boolean>;
    approvePayroll: (payrollIds: string[]) => Promise<any>;
    clearCurrentPayroll: () => void;
}, any>>;
