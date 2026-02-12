import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Auth/Login.vue'
import Recovery from '../views/Auth/Recovery.vue'
import ResetPassword from '../views/Auth/ResetPassword.vue'
import Activation from '../views/Auth/Activation.vue'
import DigitalSignature from '../views/Auth/DigitalSignature.vue'
import BrandDashboard from '../views/Dashboard/BrandDashboard.vue'
import FiscalDashboard from '../views/Dashboard/FiscalDashboard.vue'
import Discounts from '../views/Financial/Discounts.vue'
import LogicMatrix from '../views/Config/LogicMatrix.vue'
import LaborRegimes from '../views/Config/LaborRegimes.vue'
import PayrollCalculator from '../views/Payroll/Calculator.vue'
import PayrollReport from '../views/Payroll/PayrollReport.vue'
import ExportPLAME from '../views/Payroll/ExportPLAME.vue'
import VacationManagement from '../views/Vacation/VacationManagement.vue'
import SoldVacations from '../views/Vacation/SoldVacations.vue'
import AttendanceManagement from '../views/Attendance/AttendanceManagement.vue'
import OvertimeApproval from '../views/Attendance/OvertimeApproval.vue'
import PeriodClosing from '../views/Closing/PeriodClosing.vue'
import ClosingHistory from '../views/Closing/ClosingHistory.vue'
import ComparativeAnalysis from '../views/Analysis/ComparativeAnalysis.vue'
import EmployeeDocuments from '../views/Documents/EmployeeDocuments.vue'
import SuperadminPanel from '../views/Superadmin/SuperadminPanel.vue'
import AuditLog from '../views/Superadmin/AuditLog.vue'
import SuperadminRouting from '../views/Superadmin/SuperadminRouting.vue'
import EmployeeRegistration from '../views/Employees/EmployeeRegistration.vue'
import ContractManagement from '../views/Employees/ContractManagement.vue'
import DynamicRegistrationMicro from '../views/Employees/DynamicRegistrationMicro.vue'
import DynamicRegistrationIntern from '../views/Employees/DynamicRegistrationIntern.vue'
import TerminationProcess from '../views/Employees/TerminationProcess.vue'
import TerminationDocumentation from '../views/Employees/TerminationDocumentation.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  // Dashboard Routes
  { path: '/', name: 'Dashboard', component: BrandDashboard, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard Brand', component: BrandDashboard, meta: { requiresAuth: true } },
  { path: '/dashboard/fiscal', name: 'Dashboard Fiscal', component: FiscalDashboard, meta: { requiresAuth: true } },
  
  // Auth Routes
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  { path: '/recuperar-password', name: 'Recuperar Password', component: Recovery, meta: { guest: true } },
  { path: '/reset-password', name: 'Reset Password', component: ResetPassword, meta: { guest: true } },
  { path: '/activar-cuenta', name: 'Activar Cuenta', component: Activation, meta: { guest: true } },
  { path: '/firma-digital', name: 'Firma Digital', component: DigitalSignature, meta: { requiresAuth: true } },
  
  // Financial Routes
  { path: '/financials', name: 'Descuentos', component: Discounts, meta: { requiresAuth: true } },
  
  // Config Routes
  { path: '/config', name: 'Configuracion', component: LogicMatrix, meta: { requiresAuth: true } },
  { path: '/config/regimes', name: 'Regimenes Laborales', component: LaborRegimes, meta: { requiresAuth: true } },
  
  // Payroll Routes
  { path: '/payroll', name: 'Nomina', component: PayrollCalculator, meta: { requiresAuth: true } },
  { path: '/payroll/report', name: 'Boleta Pago', component: PayrollReport, meta: { requiresAuth: true } },
  { path: '/payroll/export', name: 'Export PLAME', component: ExportPLAME, meta: { requiresAuth: true } },
  
  // Vacation Routes
  { path: '/vacations', name: 'Vacaciones', component: VacationManagement, meta: { requiresAuth: true } },
  { path: '/vacations/sold', name: 'Vacaciones Vendidas', component: SoldVacations, meta: { requiresAuth: true } },
  
  // Attendance Routes
  { path: '/attendance', name: 'Asistencia', component: AttendanceManagement, meta: { requiresAuth: true } },
  { path: '/attendance/overtime', name: 'Sobretiempos', component: OvertimeApproval, meta: { requiresAuth: true } },
  
  // Closing Routes
  { path: '/closing', name: 'Cierre', component: PeriodClosing, meta: { requiresAuth: true } },
  { path: '/closing/history', name: 'Historial Cierres', component: ClosingHistory, meta: { requiresAuth: true } },
  
  // Analysis Routes
  { path: '/analysis', name: 'Analisis', component: ComparativeAnalysis, meta: { requiresAuth: true } },
  
  // Documents Routes
  { path: '/documents', name: 'Expedientes', component: EmployeeDocuments, meta: { requiresAuth: true } },
  
  // Employees Routes
  { path: '/employees/register', name: 'Alta Colaborador', component: EmployeeRegistration, meta: { requiresAuth: true } },
  { path: '/employees/contracts', name: 'Control Contratos', component: ContractManagement, meta: { requiresAuth: true } },
  { path: '/employees/register/micro', name: 'Alta Micro', component: DynamicRegistrationMicro, meta: { requiresAuth: true } },
  { path: '/employees/register/intern', name: 'Alta Practicante', component: DynamicRegistrationIntern, meta: { requiresAuth: true } },
  { path: '/employees/termination', name: 'Proceso Cese', component: TerminationProcess, meta: { requiresAuth: true } },
  { path: '/employees/documentation', name: 'Doc Salida', component: TerminationDocumentation, meta: { requiresAuth: true } },
  
  // Superadmin Routes
  { path: '/superadmin', name: 'Superadmin Panel', component: SuperadminPanel, meta: { requiresAuth: true, requiresSuperadmin: true } },
  { path: '/superadmin/audit', name: 'Audit Log', component: AuditLog, meta: { requiresAuth: true, requiresSuperadmin: true } },
  { path: '/superadmin/routing', name: 'Superadmin Routing', component: SuperadminRouting, meta: { requiresAuth: true, requiresSuperadmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  
  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  }
  else if (to.meta.guest && auth.token) {
    next('/')
  } else {
    next()
  }
})

export default router
