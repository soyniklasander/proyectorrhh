import type { Employee } from '@/types/employee.types';
export declare const useEmployeeStore: import("pinia").StoreDefinition<"employees", Pick<{
    employees: import("vue").Ref<any, any>;
    currentEmployee: any;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    fetchEmployees: () => Promise<void>;
    fetchEmployee: (id: string) => Promise<void>;
    createEmployee: (employeeData: Partial<Employee>) => Promise<any>;
    updateEmployee: (id: string, employeeData: Partial<Employee>) => Promise<any>;
    deleteEmployee: (id: string) => Promise<void>;
    clearCurrentEmployee: () => void;
}, any>, Pick<{
    employees: import("vue").Ref<any, any>;
    currentEmployee: any;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    fetchEmployees: () => Promise<void>;
    fetchEmployee: (id: string) => Promise<void>;
    createEmployee: (employeeData: Partial<Employee>) => Promise<any>;
    updateEmployee: (id: string, employeeData: Partial<Employee>) => Promise<any>;
    deleteEmployee: (id: string) => Promise<void>;
    clearCurrentEmployee: () => void;
}, any>, Pick<{
    employees: import("vue").Ref<any, any>;
    currentEmployee: any;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    fetchEmployees: () => Promise<void>;
    fetchEmployee: (id: string) => Promise<void>;
    createEmployee: (employeeData: Partial<Employee>) => Promise<any>;
    updateEmployee: (id: string, employeeData: Partial<Employee>) => Promise<any>;
    deleteEmployee: (id: string) => Promise<void>;
    clearCurrentEmployee: () => void;
}, any>>;
