import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Employee } from '@/types/employee.types'
import { api } from '@/services/api'

export const useEmployeeStore = defineStore('employees', () => {
  // State
  const employees = ref<Employee[]>([])
  const currentEmployee = ref<Employee | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/employees')
      employees.value = response.data.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar empleados'
      console.error('Error fetching employees:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchEmployee = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/employees/${id}`)
      currentEmployee.value = response.data.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar empleado'
      console.error('Error fetching employee:', err)
    } finally {
      loading.value = false
    }
  }

  const createEmployee = async (employeeData: Partial<Employee>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/employees', employeeData)
      employees.value.push(response.data.data)
      return response.data.data
    } catch (err: any) {
      error.value = err.message || 'Error al crear empleado'
      console.error('Error creating employee:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.patch(`/employees/${id}`, employeeData)
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = response.data.data
      }
      if (currentEmployee.value?.id === id) {
        currentEmployee.value = response.data.data
      }
      return response.data.data
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar empleado'
      console.error('Error updating employee:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/employees/${id}`)
      employees.value = employees.value.filter(emp => emp.id !== id)
      if (currentEmployee.value?.id === id) {
        currentEmployee.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar empleado'
      console.error('Error deleting employee:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearCurrentEmployee = () => {
    currentEmployee.value = null
  }

  return {
    // State
    employees,
    currentEmployee,
    loading,
    error,
    
    // Actions
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    clearCurrentEmployee
  }
})