<template>
  <div class="auth-layout">
    <div class="auth-container">
      <!-- Brand Section -->
      <div class="brand-section">
        <div class="logo-circle">
          <span>R</span>
        </div>
        <h1 class="brand-title">RickERP</h1>
        <p class="brand-subtitle">Plataforma de Gestión de Recursos Humanos</p>
      </div>

      <!-- Login Card -->
      <AppleCard class="auth-card" padded>
        <AppleCardHeader 
          title="Iniciar Sesión" 
          subtitle="Ingresa a tu cuenta corporativa"
        />
        
        <form @submit.prevent="handleLogin">
          <AppleFormItem label="Correo Corporativo" required :error="!!emailError" :error-message="emailError">
            <AppleInput
              :model-value="formData.email"
              type="email"
              placeholder="usuario@empresa.com"
              :prefix-icon="Mail"
              @update:model-value="formData.email = $event"
              @enter="handleLogin"
            />
          </AppleFormItem>
          
          <AppleFormItem label="Contraseña" required :error="!!passwordError" :error-message="passwordError">
            <AppleInput
              :model-value="formData.password"
              type="password"
              placeholder="••••••••"
              :prefix-icon="Lock"
              @update:model-value="formData.password = $event"
              @enter="handleLogin"
            />
          </AppleFormItem>
          
          <div class="form-actions">
            <AppleCheckbox 
              :model-value="formData.rememberMe" 
              label="Recordarme" 
              @update:model-value="formData.rememberMe = $event"
            />
            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>
          
          <div class="submit-section">
            <AppleButton
              variant="primary"
              size="large"
              block
              :loading="loading"
              @click="handleLogin"
            >
              Ingresar al Sistema
            </AppleButton>
          </div>
        </form>

        <AppleAlert v-if="error" type="error" class="mt-4">
          {{ error }}
        </AppleAlert>
      </AppleCard>

      <div class="footer-copy">
        <p>© 2024 RickERP System. Compliance Perú.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock } from 'lucide-vue-next'
import { useAuthStore } from '@/store/auth'

import {
  AppleCard,
  AppleCardHeader,
  AppleFormItem,
  AppleInput,
  AppleCheckbox,
  AppleButton,
  AppleAlert
} from '@/components/apple'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const emailError = ref('')
const passwordError = ref('')

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const validateForm = () => {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''
  
  if (!formData.email) {
    emailError.value = 'Ingrese su correo'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    emailError.value = 'Correo inválido'
    isValid = false
  }
  
  if (!formData.password) {
    passwordError.value = 'Ingrese su contraseña'
    isValid = false
  } else if (formData.password.length < 6) {
    passwordError.value = 'Mínimo 6 caracteres'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  loading.value = true
  error.value = ''
  
  try {
    const success = await authStore.login({
      email: formData.email,
      password: formData.password
    })
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = 'Credenciales incorrectas o usuario no activo.'
    }
  } catch (e) {
    error.value = 'Error al iniciar sesión. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-section {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.logo-circle {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.logo-circle span {
  font-size: 2rem;
  font-weight: 800;
  color: #007AFF;
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.brand-subtitle {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-weight: 400;
}

.auth-card {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.forgot-link {
  color: #007AFF;
  text-decoration: none;
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  transition: color 0.15s ease;
}

.forgot-link:hover {
  color: #0051D5;
  text-decoration: underline;
}

.submit-section {
  margin-top: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.footer-copy {
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
</style>
