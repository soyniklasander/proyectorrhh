/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useAuthStore } from '@/store/auth';
import { useEmployeeStore } from '@/store/employees';
import { usePayrollStore } from '@/store/payroll';
import { PeopleIcon, DocumentIcon, TimeIcon, MoneyIcon, DownloadIcon, CalculateIcon, ArrowRightIcon } from '@vicons/ionicons5';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');
const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const payrollStore = usePayrollStore();
// Reactive data
const loading = ref(false);
const showGenerateModal = ref(false);
const recentEmployees = ref([]);
const expiringContracts = ref([]);
const upcomingBirthdays = ref([]);
const recentActivities = ref([]);
const generateForm = reactive({
    period: dayjs().format('YYYY-MM'),
    employeeIds: []
});
// Computed
const user = computed(() => authStore.user);
const employeeOptions = computed(() => recentEmployees.value.map(emp => ({
    label: emp.nombreCompleto,
    value: emp.id
})));
const stats = reactive({
    activeEmployees: 0,
    activeContracts: 0,
    overtimeHours: 0,
    totalPayroll: 0
});
// Methods
const hasPermission = (permission) => {
    // TODO: Implementar verificación de permisos
    return true;
};
const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
};
const formatDateTime = (date) => {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
};
const getEmployeeStatusType = (status) => {
    const types = {
        'ACTIVO': 'success',
        'INACTIVO': 'error',
        'SUSPENDIDO': 'warning',
        'CESADO': 'default'
    };
    return types[status] || 'default';
};
const getDaysUntilBirthday = (birthDate) => {
    const today = dayjs();
    const birthday = dayjs(birthDate).year(today.year());
    if (birthday.isBefore(today)) {
        birthday.add(1, 'year');
    }
    return birthday.diff(today, 'day');
};
const getDaysUntilExpiry = (endDate) => {
    const today = dayjs();
    const expiry = dayjs(endDate);
    return expiry.diff(today, 'day');
};
const getContractUrgency = (endDate) => {
    const days = getDaysUntilExpiry(endDate);
    if (days <= 7)
        return 'error';
    if (days <= 30)
        return 'warning';
    return 'default';
};
const generatePayroll = () => {
    showGenerateModal.value = true;
};
const confirmGenerate = async () => {
    loading.value = true;
    try {
        await payrollStore.generatePayroll(generateForm.period, generateForm.employeeIds.length ? generateForm.employeeIds : undefined);
        message.success('Planilla generada exitosamente');
        showGenerateModal.value = false;
    }
    catch (error) {
        message.error('Error al generar planilla');
    }
    finally {
        loading.value = false;
    }
};
const exportPayroll = async () => {
    loading.value = true;
    try {
        await payrollStore.exportPayrollExcel(dayjs().format('YYYY-MM'));
        message.success('Archivo exportado exitosamente');
    }
    catch (error) {
        message.error('Error al exportar archivo');
    }
    finally {
        loading.value = false;
    }
};
const loadDashboardData = async () => {
    loading.value = true;
    try {
        // Cargar datos de ejemplo (implementar con APIs reales)
        stats.activeEmployees = 45;
        stats.activeContracts = 42;
        stats.overtimeHours = 127;
        stats.totalPayroll = 125450.50;
        // Datos de ejemplo para empleados recientes
        recentEmployees.value = [
            {
                id: '1',
                nombreCompleto: 'Juan Pérez García',
                puesto: 'Desarrollador Senior',
                fechaIngreso: '2024-01-15',
                estado: 'ACTIVO',
                foto: ''
            }
        ];
        // Datos de ejemplo para contratos por vencer
        expiringContracts.value = [
            {
                id: '1',
                employee: { nombreCompleto: 'María López Martínez' },
                cargo: 'Diseñadora UX',
                fechaFin: '2024-02-28'
            }
        ];
        // Datos de ejemplo para cumpleaños
        upcomingBirthdays.value = [
            {
                id: '1',
                nombreCompleto: 'Carlos Rodríguez Sánchez',
                fechaNacimiento: '1990-02-05'
            }
        ];
        // Datos de ejemplo para actividad
        recentActivities.value = [
            {
                id: '1',
                type: 'success',
                title: 'Nuevo empleado',
                description: 'Juan Pérez se unió al equipo',
                timestamp: new Date().toISOString()
            }
        ];
    }
    catch (error) {
        console.error('Error loading dashboard data:', error);
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    loadDashboardData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['n-statistic']} */
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dashboard" },
});
const __VLS_0 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    direction: "vertical",
    size: "large",
}));
const __VLS_2 = __VLS_1({
    direction: "vertical",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    justify: "space-between",
    align: "center",
}));
const __VLS_10 = __VLS_9({
    justify: "space-between",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "dashboard-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "dashboard-subtitle" },
});
(__VLS_ctx.user?.name || 'Usuario');
const __VLS_12 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
if (__VLS_ctx.hasPermission('payroll.export')) {
    const __VLS_16 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (__VLS_ctx.exportPayroll)
    };
    __VLS_19.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_19.slots;
        const __VLS_24 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        const __VLS_28 = {}.DownloadIcon;
        /** @type {[typeof __VLS_components.DownloadIcon, ]} */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
        const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
        var __VLS_27;
    }
    var __VLS_19;
}
const __VLS_32 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.generatePayroll)
};
__VLS_35.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_35.slots;
    const __VLS_40 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.CalculateIcon;
    /** @type {[typeof __VLS_components.CalculateIcon, ]} */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    var __VLS_43;
}
var __VLS_35;
var __VLS_15;
var __VLS_11;
var __VLS_7;
const __VLS_48 = {}.NGrid;
/** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    cols: "1 s:2 m:4",
    responsive: "screen",
    xGap: (16),
    yGap: (16),
}));
const __VLS_50 = __VLS_49({
    cols: "1 s:2 m:4",
    responsive: "screen",
    xGap: (16),
    yGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.NStatistic;
/** @type {[typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, ]} */
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "Empleados Activos",
    value: (__VLS_ctx.stats.activeEmployees),
}));
const __VLS_62 = __VLS_61({
    label: "Empleados Activos",
    value: (__VLS_ctx.stats.activeEmployees),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_64 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        color: "#18a058",
    }));
    const __VLS_66 = __VLS_65({
        color: "#18a058",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    const __VLS_68 = {}.PeopleIcon;
    /** @type {[typeof __VLS_components.PeopleIcon, ]} */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
    var __VLS_67;
}
var __VLS_63;
var __VLS_59;
var __VLS_55;
const __VLS_72 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.NStatistic;
/** @type {[typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, ]} */
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "Contratos Vigentes",
    value: (__VLS_ctx.stats.activeContracts),
}));
const __VLS_82 = __VLS_81({
    label: "Contratos Vigentes",
    value: (__VLS_ctx.stats.activeContracts),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_83.slots;
    const __VLS_84 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        color: "#2080f0",
    }));
    const __VLS_86 = __VLS_85({
        color: "#2080f0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.DocumentIcon;
    /** @type {[typeof __VLS_components.DocumentIcon, ]} */
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
    const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
    var __VLS_87;
}
var __VLS_83;
var __VLS_79;
var __VLS_75;
const __VLS_92 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.NStatistic;
/** @type {[typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, ]} */
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "Horas Extras Mes",
    value: (__VLS_ctx.stats.overtimeHours),
    suffix: "hrs",
}));
const __VLS_102 = __VLS_101({
    label: "Horas Extras Mes",
    value: (__VLS_ctx.stats.overtimeHours),
    suffix: "hrs",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_103.slots;
    const __VLS_104 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        color: "#f0a020",
    }));
    const __VLS_106 = __VLS_105({
        color: "#f0a020",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    const __VLS_108 = {}.TimeIcon;
    /** @type {[typeof __VLS_components.TimeIcon, ]} */
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
    const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
    var __VLS_107;
}
var __VLS_103;
var __VLS_99;
var __VLS_95;
const __VLS_112 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.NStatistic;
/** @type {[typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, typeof __VLS_components.NStatistic, typeof __VLS_components.nStatistic, ]} */
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "Total Nómina Mes",
    value: (__VLS_ctx.stats.totalPayroll),
    precision: (2),
    prefix: "S/",
}));
const __VLS_122 = __VLS_121({
    label: "Total Nómina Mes",
    value: (__VLS_ctx.stats.totalPayroll),
    precision: (2),
    prefix: "S/",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_123.slots;
    const __VLS_124 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        color: "#18a058",
    }));
    const __VLS_126 = __VLS_125({
        color: "#18a058",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    const __VLS_128 = {}.MoneyIcon;
    /** @type {[typeof __VLS_components.MoneyIcon, ]} */
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
    const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
    var __VLS_127;
}
var __VLS_123;
var __VLS_119;
var __VLS_115;
var __VLS_51;
const __VLS_132 = {}.NGrid;
/** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    cols: "1 l:2",
    responsive: "screen",
    xGap: (16),
    yGap: (16),
}));
const __VLS_134 = __VLS_133({
    cols: "1 l:2",
    responsive: "screen",
    xGap: (16),
    yGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    title: "Empleados Recientes",
    size: "small",
}));
const __VLS_142 = __VLS_141({
    title: "Empleados Recientes",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
{
    const { 'header-extra': __VLS_thisSlot } = __VLS_143.slots;
    const __VLS_144 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_146 = __VLS_145({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    let __VLS_148;
    let __VLS_149;
    let __VLS_150;
    const __VLS_151 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/empleados');
        }
    };
    __VLS_147.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_147.slots;
        const __VLS_152 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({}));
        const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
        __VLS_155.slots.default;
        const __VLS_156 = {}.ArrowRightIcon;
        /** @type {[typeof __VLS_components.ArrowRightIcon, ]} */
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({}));
        const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
        var __VLS_155;
    }
    var __VLS_147;
}
const __VLS_160 = {}.NList;
/** @type {[typeof __VLS_components.NList, typeof __VLS_components.nList, typeof __VLS_components.NList, typeof __VLS_components.nList, ]} */
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
for (const [employee] of __VLS_getVForSourceType((__VLS_ctx.recentEmployees))) {
    const __VLS_164 = {}.NListItem;
    /** @type {[typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, ]} */
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        key: (employee.id),
    }));
    const __VLS_166 = __VLS_165({
        key: (employee.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    const __VLS_168 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        align: "center",
        justify: "space-between",
    }));
    const __VLS_170 = __VLS_169({
        align: "center",
        justify: "space-between",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    const __VLS_172 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        align: "center",
    }));
    const __VLS_174 = __VLS_173({
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    const __VLS_176 = {}.NAvatar;
    /** @type {[typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, ]} */
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        src: (employee.foto),
        round: true,
    }));
    const __VLS_178 = __VLS_177({
        src: (employee.foto),
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_179.slots.default;
    (employee.nombres.charAt(0));
    var __VLS_179;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_180 = {}.NText;
    /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        strong: true,
    }));
    const __VLS_182 = __VLS_181({
        strong: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    (employee.nombreCompleto);
    var __VLS_183;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    const __VLS_184 = {}.NText;
    /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        depth: "3",
        ...{ style: {} },
    }));
    const __VLS_186 = __VLS_185({
        depth: "3",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    (employee.puesto);
    (__VLS_ctx.formatDate(employee.fechaIngreso));
    var __VLS_187;
    var __VLS_175;
    const __VLS_188 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        type: (__VLS_ctx.getEmployeeStatusType(employee.estado)),
        size: "small",
    }));
    const __VLS_190 = __VLS_189({
        type: (__VLS_ctx.getEmployeeStatusType(employee.estado)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    (employee.estado);
    var __VLS_191;
    var __VLS_171;
    var __VLS_167;
}
var __VLS_163;
var __VLS_143;
var __VLS_139;
const __VLS_192 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    title: "Próximos Cumpleaños",
    size: "small",
}));
const __VLS_198 = __VLS_197({
    title: "Próximos Cumpleaños",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.NList;
/** @type {[typeof __VLS_components.NList, typeof __VLS_components.nList, typeof __VLS_components.NList, typeof __VLS_components.nList, ]} */
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({}));
const __VLS_202 = __VLS_201({}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
for (const [employee] of __VLS_getVForSourceType((__VLS_ctx.upcomingBirthdays))) {
    const __VLS_204 = {}.NListItem;
    /** @type {[typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, ]} */
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        key: (employee.id),
    }));
    const __VLS_206 = __VLS_205({
        key: (employee.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    const __VLS_208 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        align: "center",
        justify: "space-between",
    }));
    const __VLS_210 = __VLS_209({
        align: "center",
        justify: "space-between",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    __VLS_211.slots.default;
    const __VLS_212 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        align: "center",
    }));
    const __VLS_214 = __VLS_213({
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_215.slots.default;
    const __VLS_216 = {}.NAvatar;
    /** @type {[typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, ]} */
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        round: true,
    }));
    const __VLS_218 = __VLS_217({
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    __VLS_219.slots.default;
    var __VLS_219;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_220 = {}.NText;
    /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        strong: true,
    }));
    const __VLS_222 = __VLS_221({
        strong: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    __VLS_223.slots.default;
    (employee.nombreCompleto);
    var __VLS_223;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    const __VLS_224 = {}.NText;
    /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        depth: "3",
        ...{ style: {} },
    }));
    const __VLS_226 = __VLS_225({
        depth: "3",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    __VLS_227.slots.default;
    (__VLS_ctx.formatDate(employee.fechaNacimiento));
    var __VLS_227;
    var __VLS_215;
    const __VLS_228 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        type: "warning",
        size: "small",
    }));
    const __VLS_230 = __VLS_229({
        type: "warning",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    __VLS_231.slots.default;
    (__VLS_ctx.getDaysUntilBirthday(employee.fechaNacimiento));
    var __VLS_231;
    var __VLS_211;
    var __VLS_207;
}
var __VLS_203;
var __VLS_199;
var __VLS_195;
const __VLS_232 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({}));
const __VLS_234 = __VLS_233({}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
const __VLS_236 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    title: "Contratos por Vencer",
    size: "small",
}));
const __VLS_238 = __VLS_237({
    title: "Contratos por Vencer",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
{
    const { 'header-extra': __VLS_thisSlot } = __VLS_239.slots;
    const __VLS_240 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_242 = __VLS_241({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    let __VLS_244;
    let __VLS_245;
    let __VLS_246;
    const __VLS_247 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/contratos');
        }
    };
    __VLS_243.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_243.slots;
        const __VLS_248 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
        // @ts-ignore
        const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({}));
        const __VLS_250 = __VLS_249({}, ...__VLS_functionalComponentArgsRest(__VLS_249));
        __VLS_251.slots.default;
        const __VLS_252 = {}.ArrowRightIcon;
        /** @type {[typeof __VLS_components.ArrowRightIcon, ]} */
        // @ts-ignore
        const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({}));
        const __VLS_254 = __VLS_253({}, ...__VLS_functionalComponentArgsRest(__VLS_253));
        var __VLS_251;
    }
    var __VLS_243;
}
const __VLS_256 = {}.NList;
/** @type {[typeof __VLS_components.NList, typeof __VLS_components.nList, typeof __VLS_components.NList, typeof __VLS_components.nList, ]} */
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({}));
const __VLS_258 = __VLS_257({}, ...__VLS_functionalComponentArgsRest(__VLS_257));
__VLS_259.slots.default;
for (const [contract] of __VLS_getVForSourceType((__VLS_ctx.expiringContracts))) {
    const __VLS_260 = {}.NListItem;
    /** @type {[typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, ]} */
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
        key: (contract.id),
    }));
    const __VLS_262 = __VLS_261({
        key: (contract.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    __VLS_263.slots.default;
    const __VLS_264 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
        align: "center",
        justify: "space-between",
    }));
    const __VLS_266 = __VLS_265({
        align: "center",
        justify: "space-between",
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    __VLS_267.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_268 = {}.NText;
    /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */
    // @ts-ignore
    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
        strong: true,
    }));
    const __VLS_270 = __VLS_269({
        strong: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
    __VLS_271.slots.default;
    (contract.employee?.nombreCompleto);
    var __VLS_271;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    const __VLS_272 = {}.NText;
    /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        depth: "3",
        ...{ style: {} },
    }));
    const __VLS_274 = __VLS_273({
        depth: "3",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    __VLS_275.slots.default;
    (contract.cargo);
    (__VLS_ctx.formatDate(contract.fechaFin));
    var __VLS_275;
    const __VLS_276 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */
    // @ts-ignore
    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
        type: (__VLS_ctx.getContractUrgency(contract.fechaFin)),
        size: "small",
    }));
    const __VLS_278 = __VLS_277({
        type: (__VLS_ctx.getContractUrgency(contract.fechaFin)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    __VLS_279.slots.default;
    (__VLS_ctx.getDaysUntilExpiry(contract.fechaFin));
    var __VLS_279;
    var __VLS_267;
    var __VLS_263;
}
var __VLS_259;
var __VLS_239;
var __VLS_235;
const __VLS_280 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({}));
const __VLS_282 = __VLS_281({}, ...__VLS_functionalComponentArgsRest(__VLS_281));
__VLS_283.slots.default;
const __VLS_284 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    title: "Actividad Reciente",
    size: "small",
}));
const __VLS_286 = __VLS_285({
    title: "Actividad Reciente",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.NTimeline;
/** @type {[typeof __VLS_components.NTimeline, typeof __VLS_components.nTimeline, typeof __VLS_components.NTimeline, typeof __VLS_components.nTimeline, ]} */
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({}));
const __VLS_290 = __VLS_289({}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
for (const [activity] of __VLS_getVForSourceType((__VLS_ctx.recentActivities))) {
    const __VLS_292 = {}.NTimelineItem;
    /** @type {[typeof __VLS_components.NTimelineItem, typeof __VLS_components.nTimelineItem, ]} */
    // @ts-ignore
    const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
        key: (activity.id),
        type: (activity.type),
        title: (activity.title),
        content: (activity.description),
        time: (__VLS_ctx.formatDateTime(activity.timestamp)),
    }));
    const __VLS_294 = __VLS_293({
        key: (activity.id),
        type: (activity.type),
        title: (activity.title),
        content: (activity.description),
        time: (__VLS_ctx.formatDateTime(activity.timestamp)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_293));
}
var __VLS_291;
var __VLS_287;
var __VLS_283;
var __VLS_135;
var __VLS_3;
const __VLS_296 = {}.NModal;
/** @type {[typeof __VLS_components.NModal, typeof __VLS_components.nModal, typeof __VLS_components.NModal, typeof __VLS_components.nModal, ]} */
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    show: (__VLS_ctx.showGenerateModal),
    preset: "dialog",
    title: "Generar Planilla",
}));
const __VLS_298 = __VLS_297({
    show: (__VLS_ctx.showGenerateModal),
    preset: "dialog",
    title: "Generar Planilla",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
__VLS_299.slots.default;
const __VLS_300 = {}.NForm;
/** @type {[typeof __VLS_components.NForm, typeof __VLS_components.nForm, typeof __VLS_components.NForm, typeof __VLS_components.nForm, ]} */
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    model: (__VLS_ctx.generateForm),
    labelPlacement: "left",
    labelWidth: (100),
}));
const __VLS_302 = __VLS_301({
    model: (__VLS_ctx.generateForm),
    labelPlacement: "left",
    labelWidth: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
const __VLS_304 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    label: "Período",
}));
const __VLS_306 = __VLS_305({
    label: "Período",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
const __VLS_308 = {}.NDatePicker;
/** @type {[typeof __VLS_components.NDatePicker, typeof __VLS_components.nDatePicker, ]} */
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    value: (__VLS_ctx.generateForm.period),
    type: "month",
    format: "MM/yyyy",
    ...{ style: {} },
}));
const __VLS_310 = __VLS_309({
    value: (__VLS_ctx.generateForm.period),
    type: "month",
    format: "MM/yyyy",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
var __VLS_307;
const __VLS_312 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    label: "Empleados",
}));
const __VLS_314 = __VLS_313({
    label: "Empleados",
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
const __VLS_316 = {}.NCheckboxGroup;
/** @type {[typeof __VLS_components.NCheckboxGroup, typeof __VLS_components.nCheckboxGroup, typeof __VLS_components.NCheckboxGroup, typeof __VLS_components.nCheckboxGroup, ]} */
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    value: (__VLS_ctx.generateForm.employeeIds),
}));
const __VLS_318 = __VLS_317({
    value: (__VLS_ctx.generateForm.employeeIds),
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
const __VLS_320 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
    vertical: true,
}));
const __VLS_322 = __VLS_321({
    vertical: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_321));
__VLS_323.slots.default;
for (const [emp] of __VLS_getVForSourceType((__VLS_ctx.employeeOptions))) {
    const __VLS_324 = {}.NCheckbox;
    /** @type {[typeof __VLS_components.NCheckbox, typeof __VLS_components.nCheckbox, ]} */
    // @ts-ignore
    const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
        key: (emp.value),
        value: (emp.value),
        label: (emp.label),
    }));
    const __VLS_326 = __VLS_325({
        key: (emp.value),
        value: (emp.value),
        label: (emp.label),
    }, ...__VLS_functionalComponentArgsRest(__VLS_325));
}
var __VLS_323;
var __VLS_319;
var __VLS_315;
var __VLS_303;
{
    const { action: __VLS_thisSlot } = __VLS_299.slots;
    const __VLS_328 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
    // @ts-ignore
    const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({}));
    const __VLS_330 = __VLS_329({}, ...__VLS_functionalComponentArgsRest(__VLS_329));
    __VLS_331.slots.default;
    const __VLS_332 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
        ...{ 'onClick': {} },
    }));
    const __VLS_334 = __VLS_333({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_333));
    let __VLS_336;
    let __VLS_337;
    let __VLS_338;
    const __VLS_339 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showGenerateModal = false;
        }
    };
    __VLS_335.slots.default;
    var __VLS_335;
    const __VLS_340 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_342 = __VLS_341({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_341));
    let __VLS_344;
    let __VLS_345;
    let __VLS_346;
    const __VLS_347 = {
        onClick: (__VLS_ctx.confirmGenerate)
    };
    __VLS_343.slots.default;
    var __VLS_343;
    var __VLS_331;
}
var __VLS_299;
/** @type {__VLS_StyleScopedClasses['dashboard']} */
/** @type {__VLS_StyleScopedClasses['dashboard-title']} */
/** @type {__VLS_StyleScopedClasses['dashboard-subtitle']} */
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            PeopleIcon: PeopleIcon,
            DocumentIcon: DocumentIcon,
            TimeIcon: TimeIcon,
            MoneyIcon: MoneyIcon,
            DownloadIcon: DownloadIcon,
            CalculateIcon: CalculateIcon,
            ArrowRightIcon: ArrowRightIcon,
            loading: loading,
            showGenerateModal: showGenerateModal,
            recentEmployees: recentEmployees,
            expiringContracts: expiringContracts,
            upcomingBirthdays: upcomingBirthdays,
            recentActivities: recentActivities,
            generateForm: generateForm,
            user: user,
            employeeOptions: employeeOptions,
            stats: stats,
            hasPermission: hasPermission,
            formatDate: formatDate,
            formatDateTime: formatDateTime,
            getEmployeeStatusType: getEmployeeStatusType,
            getDaysUntilBirthday: getDaysUntilBirthday,
            getDaysUntilExpiry: getDaysUntilExpiry,
            getContractUrgency: getContractUrgency,
            generatePayroll: generatePayroll,
            confirmGenerate: confirmGenerate,
            exportPayroll: exportPayroll,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
