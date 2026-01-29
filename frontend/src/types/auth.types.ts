// Tipos para autenticación
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'hr' | 'manager' | 'viewer'
  permissions: string[]
  avatar?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: User['role']
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface PasswordReset {
  email: string
  newPassword: string
  resetToken: string
}

export interface ChangePassword {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}