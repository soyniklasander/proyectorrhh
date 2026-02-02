<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="brand-section">
        <div class="logo-circle">
          <span>R</span>
        </div>
        <h1 class="brand-title">RickERP</h1>
        <p class="brand-subtitle">Plataforma de Gestión de Recursos Humanos</p>
      </div>

      <div class="auth-card">
        <div class="auth-header">
          <h2>Iniciar Sesión</h2>
          <p class="text-secondary">Ingresa a tu cuenta corporativa</p>
        </div>
        
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          size="large"
          @submit.prevent="handleLogin"
        >
          <n-form-item path="email" label="Correo Corporativo">
            <n-input
              v-model:value="formData.email"
              placeholder="ej. usuario@empresa.com"
              type="email"
            >
              <template #prefix>
                <n-icon><MailOutline /></n-icon>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item path="password" label="Contraseña">
            <n-input
              v-model:value="formData.password"
              placeholder="••••••••"
              type="password"
              show-password-on="click"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <n-icon><LockClosedOutline /></n-icon>
              </template>
            </n-input>
          </n-form-item>
          
          <div class="form-actions">
            <n-checkbox v-model:checked="formData.rememberMe">
              Recordarme
            </n-checkbox>
            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>
          
          <div class="submit-section">
            <n-button
              type="primary"
              size="large"
              :loading="loading"
              block
              attr-type="submit"
              class="submit-btn"
            >
              Ingresar al Sistema
            </n-button>
          </div>
        </n-form>

        <div v-if="error" class="error-container">
          <n-alert type="error" show-icon>
            {{ error }}
          </n-alert>
        </div>
      </div>

      <div class="footer-copy">
        <p>© 2024 RickERP System. Compliance Perú.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { MailOutline, LockClosedOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/store/auth'
import type { FormInst, FormRules } from 'naive-ui'

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

const rules: FormRules = {
  email: [
    { required: true, message: 'Ingrese su correo', trigger: 'blur' },
    { type: 'email', message: 'Correo inválido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Ingrese su contraseña', trigger: 'blur' },
    { min: 6, message: 'Mínimo 6 caracteres', trigger: 'blur' }
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
      password: formData.password
    })
    
    if (success) {
      message.success('Sesión iniciada correctamente')
      router.push('/dashboard')
    } else {
      error.value = 'Credenciales incorrectas o usuario no activo.'
    }
  } catch (e) {
    // Validation error
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
  background-color: #f0f2f5;
  background-image:
    radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
    radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
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
  color: #4f46e5;
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-weight: 300;
}

.auth-card {
  background: white;
  width: 100%;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.auth-header {
  margin-bottom: 2rem;
  text-align: left;
}

.auth-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem;
}

.text-secondary {
  color: #6b7280;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.forgot-link {
  color: #4f46e5;
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.submit-section {
  margin-top: 1rem;
}

.submit-btn {
  font-weight: 600;
}

.error-container {
  margin-top: 1.5rem;
}

.footer-copy {
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}
</style>
