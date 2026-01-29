<template>
  <div class="employee-form-container">
    <n-card :title="pageTitle">
      <template #header-extra>
        <n-button @click="$router.go(-1)">
          <template #icon>
            <n-icon><ArrowBackIcon /></n-icon>
          </template>
          Volver
        </n-button>
      </template>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="top"
        :size="isMobile ? 'medium' : 'large'"
        :show-label="!isMobile"
      >
        <n-tabs v-model:value="activeTab" type="line" justify-content="center">
          <!-- Datos Personales -->
          <n-tab-pane name="personal" tab="Datos Personales">
            <n-grid cols="1 s:2 m:3" responsive="screen" :x-gap="24" :y-gap="16">
              <n-grid-item>
                <n-form-item label="Nombres" path="nombres">
                  <n-input
                    v-model:value="formData.nombres"
                    placeholder="Juan"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Apellido Paterno" path="apellidoPaterno">
                  <n-input
                    v-model:value="formData.apellidoPaterno"
                    placeholder="Pérez"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Apellido Materno" path="apellidoMaterno">
                  <n-input
                    v-model:value="formData.apellidoMaterno"
                    placeholder="García"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Tipo Documento" path="tipoDocumento">
                  <n-select
                    v-model:value="formData.tipoDocumento"
                    :options="TIPO_DOCUMENTO_OPTIONS"
                    placeholder="Seleccionar tipo"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Número de Documento" path="numeroDocumento">
                  <n-input
                    v-model:value="formData.numeroDocumento"
                    placeholder="12345678"
                    :disabled="loading"
                    maxlength="8"
                    @blur="validateDocument"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Fecha de Nacimiento" path="fechaNacimiento">
                  <n-date-picker
                    v-model:value="formData.fechaNacimiento"
                    type="date"
                    format="dd/MM/yyyy"
                    :disabled="loading"
                    style="width: 100%"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Lugar de Nacimiento">
                  <n-input
                    v-model:value="formData.lugarNacimiento"
                    placeholder="Lima, Perú"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Sexo">
                  <n-radio-group v-model:value="formData.sexo" :disabled="loading">
                    <n-radio-button value="M">Masculino</n-radio-button>
                    <n-radio-button value="F">Femenino</n-radio-button>
                  </n-radio-group>
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Estado Civil">
                  <n-select
                    v-model:value="formData.estadoCivil"
                    :options="ESTADO_CIVIL_OPTIONS"
                    placeholder="Seleccionar estado"
                    clearable
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Nacionalidad">
                  <n-input
                    v-model:value="formData.nacionalidad"
                    placeholder="Peruana"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Número de Hijos">
                  <n-input-number
                    v-model:value="formData.hijos"
                    :min="0"
                    :max="20"
                    style="width: 100%"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Nivel Educativo">
                  <n-select
                    v-model:value="formData.nivelEducativo"
                    :options="NIVEL_EDUCATIVO_OPTIONS"
                    placeholder="Seleccionar nivel"
                    clearable
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Profesión">
                  <n-input
                    v-model:value="formData.profesion"
                    placeholder="Ingeniero de Sistemas"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-divider>Dirección y Contacto</n-divider>
            
            <n-grid cols="1 s:2 m:2" responsive="screen" :x-gap="24" :y-gap="16">
              <n-grid-item>
                <n-form-item label="Dirección">
                  <n-input
                    v-model:value="formData.direccion"
                    placeholder="Av. Principal 123"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Departamento">
                  <n-select
                    v-model:value="formData.departamento"
                    :options="departmentOptions"
                    placeholder="Lima"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Provincia">
                  <n-select
                    v-model:value="formData.provincia"
                    :options="provinceOptions"
                    placeholder="Lima"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Distrito">
                  <n-select
                    v-model:value="formData.distrito"
                    :options="districtOptions"
                    placeholder="San Borja"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Teléfono">
                  <n-input
                    v-model:value="formData.telefono"
                    placeholder="999 123 456"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Email Personal">
                  <n-input
                    v-model:value="formData.email"
                    placeholder="correo@ejemplo.com"
                    type="email"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item :span="2">
                <n-form-item label="Email Corporativo">
                  <n-input
                    v-model:value="formData.emailCorporativo"
                    placeholder="nombre@empresa.com"
                    type="email"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-tab-pane>

          <!-- Datos Bancarios -->
          <n-tab-pane name="banking" tab="Datos Bancarios">
            <n-grid cols="1 s:2 m:2" responsive="screen" :x-gap="24" :y-gap="16">
              <n-grid-item>
                <n-form-item label="Banco">
                  <n-select
                    v-model:value="formData.banco"
                    :options="bankOptions"
                    placeholder="Seleccionar banco"
                    clearable
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Tipo de Cuenta">
                  <n-select
                    v-model:value="formData.tipoCuenta"
                    :options="TIPO_CUENTA_OPTIONS"
                    placeholder="Seleccionar tipo"
                    clearable
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Número de Cuenta">
                  <n-input
                    v-model:value="formData.numeroCuenta"
                    placeholder="194-12345678-0-12"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="CCI (Código Interbancario)">
                  <n-input
                    v-model:value="formData.numeroCCI"
                    placeholder="002-194-000123456789-12"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-tab-pane>

          <!-- Datos Laborales -->
          <n-tab-pane name="laboral" tab="Datos Laborales">
            <n-grid cols="1 s:2 m:2" responsive="screen" :x-gap="24" :y-gap="16">
              <n-grid-item>
                <n-form-item label="Fecha de Ingreso" path="fechaIngreso">
                  <n-date-picker
                    v-model:value="formData.fechaIngreso"
                    type="date"
                    format="dd/MM/yyyy"
                    :disabled="loading"
                    style="width: 100%"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Puesto">
                  <n-input
                    v-model:value="formData.puesto"
                    placeholder="Desarrollador Senior"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Departamento de Trabajo">
                  <n-input
                    v-model:value="formData.departamentoTrabajo"
                    placeholder="Tecnología"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Área de Trabajo">
                  <n-input
                    v-model:value="formData.areaTrabajo"
                    placeholder="Desarrollo Web"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Licencia de Conducir">
                  <n-input
                    v-model:value="formData.licenciaConducir"
                    placeholder="A1 - Motos"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
              
              <n-grid-item>
                <n-form-item label="Estado" path="estado">
                  <n-select
                    v-model:value="formData.estado"
                    :options="ESTADO_EMPLEADO_OPTIONS"
                    placeholder="Seleccionar estado"
                    :disabled="loading"
                  />
                </n-form-item>
              </n-grid-item>
            </n-grid>
          </n-tab-pane>

          <!-- Documentos -->
          <n-tab-pane name="documents" tab="Documentos">
            <n-space vertical size="large">
              <n-grid cols="1 s:2 m:2" responsive="screen" :x-gap="24" :y-gap="16">
                <n-grid-item>
                  <n-form-item label="Foto del Empleado">
                    <n-upload
                      :default-file-list="fotoFileList"
                      :max="1"
                      list-type="image-card"
                      @update:file-list="handleFotoUpload"
                    >
                      Click para subir foto
                    </n-upload>
                  </n-form-item>
                </n-grid-item>
                
                <n-grid-item>
                  <n-form-item label="Foto del DNI">
                    <n-upload
                      :default-file-list="dniFileList"
                      :max="1"
                      @update:file-list="handleDNIUpload"
                    >
                      <n-button>Subir DNI</n-button>
                    </n-upload>
                  </n-form-item>
                </n-grid-item>
              </n-grid>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-form>

      <template #footer>
        <n-space justify="end" size="large">
          <n-button @click="$router.go(-1)" :disabled="loading">
            Cancelar
          </n-button>
          <n-button type="primary" :loading="loading" @click="handleSubmit">
            {{ isEditing ? 'Actualizar' : 'Crear' }} Empleado
          </n-button>
        </n-space>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useEmployeeStore } from '@/store/employees'
import { 
  ArrowBackIcon 
} from '@vicons/ionicons5'
import { 
  TIPO_DOCUMENTO_OPTIONS, ESTADO_CIVIL_OPTIONS, NIVEL_EDUCATIVO_OPTIONS,
  TIPO_CUENTA_OPTIONS, ESTADO_EMPLEADO_OPTIONS
} from '@/types/employee.types'
import type { FormInst, FormRules, UploadFileInfo } from 'naive-ui'
import type { Employee, EmployeeCreate, EmployeeUpdate } from '@/types/employee.types'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const employeeStore = useEmployeeStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const activeTab = ref('personal')
const isMobile = ref(false)

const isEditing = computed(() => !!route.params.id)
const pageTitle = computed(() => isEditing.value ? 'Editar Empleado' : 'Nuevo Empleado')

// Form data
const formData = reactive({
  // Datos personales
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  tipoDocumento: 'DNI' as any,
  numeroDocumento: '',
  fechaNacimiento: null as any,
  lugarNacimiento: '',
  sexo: null as any,
  estadoCivil: null as any,
  nacionalidad: 'Peruana',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  telefono: '',
  email: '',
  emailCorporativo: '',
  nivelEducativo: null as any,
  profesion: '',
  licenciaConducir: '',
  hijos: 0,
  
  // Datos bancarios
  banco: '',
  tipoCuenta: null as any,
  numeroCuenta: '',
  numeroCCI: '',
  
  // Datos laborales
  fechaIngreso: null as any,
  puesto: '',
  departamentoTrabajo: '',
  areaTrabajo: '',
  estado: 'ACTIVO' as any,
  
  // Fotos y documentos
  foto: '',
  fotoDNI: '',
  fotoRUC: ''
})

// File lists
const fotoFileList = ref<UploadFileInfo[]>([])
const dniFileList = ref<UploadFileInfo[]>([])

// Options (mock data - replace with real API)
const departmentOptions = [
  { label: 'Lima', value: 'Lima' },
  { label: 'Arequipa', value: 'Arequipa' },
  { label: 'Trujillo', value: 'Trujillo' },
  { label: 'Cusco', value: 'Cusco' }
]

const provinceOptions = [
  { label: 'Lima', value: 'Lima' },
  { label: 'Arequipa', value: 'Arequipa' },
  { label: 'Trujillo', value: 'Trujillo' }
]

const districtOptions = [
  { label: 'San Borja', value: 'San Borja' },
  { label: 'Miraflores', value: 'Miraflores' },
  { label: 'San Isidro', value: 'San Isidro' }
]

const bankOptions = [
  { label: 'BCP', value: 'BCP' },
  { label: 'Interbank', value: 'Interbank' },
  { label: 'Scotiabank', value: 'Scotiabank' },
  { label: 'BBVA', value: 'BBVA' }
]

// Form rules
const formRules: FormRules = {
  nombres: [
    { required: true, message: 'Por favor ingresa los nombres', trigger: 'blur' }
  ],
  apellidoPaterno: [
    { required: true, message: 'Por favor ingresa el apellido paterno', trigger: 'blur' }
  ],
  apellidoMaterno: [
    { required: true, message: 'Por favor ingresa el apellido materno', trigger: 'blur' }
  ],
  tipoDocumento: [
    { required: true, message: 'Por favor selecciona el tipo de documento', trigger: 'change' }
  ],
  numeroDocumento: [
    { required: true, message: 'Por favor ingresa el número de documento', trigger: 'blur' },
    { len: 8, message: 'El DNI debe tener exactamente 8 dígitos', trigger: 'blur' }
  ],
  fechaNacimiento: [
    { required: true, message: 'Por favor ingresa la fecha de nacimiento', trigger: 'change' }
  ],
  fechaIngreso: [
    { required: true, message: 'Por favor ingresa la fecha de ingreso', trigger: 'change' }
  ],
  estado: [
    { required: true, message: 'Por favor selecciona el estado', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: 'Por favor ingresa un email válido', trigger: ['blur', 'change'] }
  ],
  emailCorporativo: [
    { type: 'email', message: 'Por favor ingresa un email válido', trigger: ['blur', 'change'] }
  ]
}

// Methods
const validateDocument = () => {
  if (formData.tipoDocumento === 'DNI' && formData.numeroDocumento) {
    if (formData.numeroDocumento.length !== 8) {
      message.warning('El DNI debe tener exactamente 8 dígitos')
    }
  }
}

const handleFotoUpload = (fileList: UploadFileInfo[]) => {
  fotoFileList.value = fileList
  if (fileList.length > 0 && fileList[0].file) {
    // TODO: Upload file to server and get URL
    formData.foto = 'uploaded-foto-url'
  }
}

const handleDNIUpload = (fileList: UploadFileInfo[]) => {
  dniFileList.value = fileList
  if (fileList.length > 0 && fileList[0].file) {
    // TODO: Upload file to server and get URL
    formData.fotoDNI = 'uploaded-dni-url'
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // Generate complete name
    const nombreCompleto = `${formData.nombres} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`
    
    if (isEditing.value) {
      const updateData: EmployeeUpdate = {
        ...formData,
        nombreCompleto
      }
      await employeeStore.updateEmployee(route.params.id as string, updateData)
      message.success('Empleado actualizado exitosamente')
    } else {
      const createData: EmployeeCreate = {
        nombres: formData.nombres,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        fechaNacimiento: new Date(formData.fechaNacimiento).toISOString(),
        estadoCivil: formData.estadoCivil,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        banco: formData.banco,
        tipoCuenta: formData.tipoCuenta,
        numeroCuenta: formData.numeroCuenta,
        numeroCCI: formData.numeroCCI,
        fechaIngreso: new Date(formData.fechaIngreso).toISOString(),
        puesto: formData.puesto,
        departamentoTrabajo: formData.departamentoTrabajo
      }
      
      await employeeStore.createEmployee(createData)
      message.success('Empleado creado exitosamente')
    }
    
    router.push('/empleados')
    
  } catch (error) {
    message.error('Error al guardar el empleado')
    console.error('Save employee error:', error)
  } finally {
    loading.value = false
  }
}

const loadEmployee = async () => {
  if (!isEditing.value) return
  
  loading.value = true
  
  try {
    await employeeStore.fetchEmployee(route.params.id as string)
    
    const employee = employeeStore.currentEmployee
    if (employee) {
      // Fill form with employee data
      Object.assign(formData, {
        ...employee,
        fechaNacimiento: employee.fechaNacimiento ? new Date(employee.fechaNacimiento).getTime() : null,
        fechaIngreso: new Date(employee.fechaIngreso).getTime()
      })
    }
  } catch (error) {
    message.error('Error al cargar el empleado')
    router.push('/empleados')
  } finally {
    loading.value = false
  }
}

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  if (isEditing.value) {
    loadEmployee()
  }
})
</script>

<style scoped>
.employee-form-container {
  padding: 0;
}

:deep(.n-form-item-label) {
  font-weight: 500;
  color: var(--text-primary);
}

:deep(.n-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.n-grid-item) {
  display: flex;
  align-items: flex-end;
}

:deep(.n-upload) {
  width: 100%;
}

@media (max-width: 768px) {
  :deep(.n-grid) {
    grid-template-columns: 1fr !important;
  }
}
</style>