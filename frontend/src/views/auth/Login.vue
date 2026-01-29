<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">RRHH Mod</h1>
          <p class="auth-subtitle">Gestión de Personal Perú</p>
        </div>
        
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          @submit.prevent="handleLogin"
        >
          <n-form-item path="email" label="Correo Electrónico">
            <n-input
              v-model:value="formData.email"
              placeholder="correo@empresa.com"
              type="email"
              size="large"
              :disabled="loading"
            />
          </n-form-item>
          
          <n-form-item path="password" label="Contraseña">
            <n-input
              v-model:value="formData.password"
              placeholder="Ingresa tu contraseña"
              type="password"
              show-password-on="click"
              size="large"
              :disabled="loading"
              @keyup.enter="handleLogin"
            />
          </n-form-item>
          
          <n-form-item>
            <n-checkbox v-model:checked="formData.rememberMe">
              Recordar sesión
            </n-checkbox>
          </n-form-item>
          
          <n-form-item>
            <n-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="loading"
              block
              @click="handleLogin"
            >
              {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </n-button>
          </n-form-item>
        </n-form>
        
        <div class="auth-footer">
          <n-alert v-if="error" type="error" :title="error" show-icon />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/store/auth'
import type { FormInst, FormValidationError } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const error = ref('')

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const rules = {
  email: [
    {
      required: true,
      message: 'Por favor ingresa tu correo electrónico',
      trigger: ['input', 'blur']
    },
    {
      type: 'email',
      message: 'Por favor ingresa un correo válido',
      trigger: ['input', 'blur']
    }
  ],
  password: [
    {
      required: true,
      message: 'Por favor ingresa tu contraseña',
      trigger: ['input', 'blur']
    },
    {
      min: 6,
      message: 'La contraseña debe tener al menos 6 caracteres',
      trigger: ['input', 'blur']
    }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    error.value = ''
    
    const success = await authStore.login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    })
    
    if (success) {
      message.success('¡Bienvenido de nuevo!')
      router.push('/dashboard')
    } else {
      error.value = 'Credenciales inválidas. Por favor intenta nuevamente.'
    }
  } catch (errors: FormValidationError) {
    console.error('Validation errors:', errors)
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
  max-width: 400px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.auth-footer {
  margin-top: 1rem;
}

/* Dark mode support */
:root.dark .auth-card {
  background: #1e293b;
}

:root.dark .auth-title {
  color: #f1f5f9;
}

:root.dark .auth-subtitle {
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 640px) {
  .auth-container {
    max-width: 100%;
  }
  
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
}
</style>