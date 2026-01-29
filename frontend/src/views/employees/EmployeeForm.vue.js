/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useEmployeeStore } from '@/store/employees';
import { ArrowBackIcon } from '@vicons/ionicons5';
import { TIPO_DOCUMENTO_OPTIONS, ESTADO_CIVIL_OPTIONS, NIVEL_EDUCATIVO_OPTIONS, TIPO_CUENTA_OPTIONS, ESTADO_EMPLEADO_OPTIONS } from '@/types/employee.types';
const route = useRoute();
const router = useRouter();
const message = useMessage();
const employeeStore = useEmployeeStore();
const formRef = ref(null);
const loading = ref(false);
const activeTab = ref('personal');
const isMobile = ref(false);
const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'Editar Empleado' : 'Nuevo Empleado');
// Form data
const formData = reactive({
    // Datos personales
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    fechaNacimiento: null,
    lugarNacimiento: '',
    sexo: null,
    estadoCivil: null,
    nacionalidad: 'Peruana',
    direccion: '',
    departamento: '',
    provincia: '',
    distrito: '',
    telefono: '',
    email: '',
    emailCorporativo: '',
    nivelEducativo: null,
    profesion: '',
    licenciaConducir: '',
    hijos: 0,
    // Datos bancarios
    banco: '',
    tipoCuenta: null,
    numeroCuenta: '',
    numeroCCI: '',
    // Datos laborales
    fechaIngreso: null,
    puesto: '',
    departamentoTrabajo: '',
    areaTrabajo: '',
    estado: 'ACTIVO',
    // Fotos y documentos
    foto: '',
    fotoDNI: '',
    fotoRUC: ''
});
// File lists
const fotoFileList = ref([]);
const dniFileList = ref([]);
// Options (mock data - replace with real API)
const departmentOptions = [
    { label: 'Lima', value: 'Lima' },
    { label: 'Arequipa', value: 'Arequipa' },
    { label: 'Trujillo', value: 'Trujillo' },
    { label: 'Cusco', value: 'Cusco' }
];
const provinceOptions = [
    { label: 'Lima', value: 'Lima' },
    { label: 'Arequipa', value: 'Arequipa' },
    { label: 'Trujillo', value: 'Trujillo' }
];
const districtOptions = [
    { label: 'San Borja', value: 'San Borja' },
    { label: 'Miraflores', value: 'Miraflores' },
    { label: 'San Isidro', value: 'San Isidro' }
];
const bankOptions = [
    { label: 'BCP', value: 'BCP' },
    { label: 'Interbank', value: 'Interbank' },
    { label: 'Scotiabank', value: 'Scotiabank' },
    { label: 'BBVA', value: 'BBVA' }
];
// Form rules
const formRules = {
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
};
// Methods
const validateDocument = () => {
    if (formData.tipoDocumento === 'DNI' && formData.numeroDocumento) {
        if (formData.numeroDocumento.length !== 8) {
            message.warning('El DNI debe tener exactamente 8 dígitos');
        }
    }
};
const handleFotoUpload = (fileList) => {
    fotoFileList.value = fileList;
    if (fileList.length > 0 && fileList[0].file) {
        // TODO: Upload file to server and get URL
        formData.foto = 'uploaded-foto-url';
    }
};
const handleDNIUpload = (fileList) => {
    dniFileList.value = fileList;
    if (fileList.length > 0 && fileList[0].file) {
        // TODO: Upload file to server and get URL
        formData.fotoDNI = 'uploaded-dni-url';
    }
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        loading.value = true;
        // Generate complete name
        const nombreCompleto = `${formData.nombres} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`;
        if (isEditing.value) {
            const updateData = {
                ...formData,
                nombreCompleto
            };
            await employeeStore.updateEmployee(route.params.id, updateData);
            message.success('Empleado actualizado exitosamente');
        }
        else {
            const createData = {
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
            };
            await employeeStore.createEmployee(createData);
            message.success('Empleado creado exitosamente');
        }
        router.push('/empleados');
    }
    catch (error) {
        message.error('Error al guardar el empleado');
        console.error('Save employee error:', error);
    }
    finally {
        loading.value = false;
    }
};
const loadEmployee = async () => {
    if (!isEditing.value)
        return;
    loading.value = true;
    try {
        await employeeStore.fetchEmployee(route.params.id);
        const employee = employeeStore.currentEmployee;
        if (employee) {
            // Fill form with employee data
            Object.assign(formData, {
                ...employee,
                fechaNacimiento: employee.fechaNacimiento ? new Date(employee.fechaNacimiento).getTime() : null,
                fechaIngreso: new Date(employee.fechaIngreso).getTime()
            });
        }
    }
    catch (error) {
        message.error('Error al cargar el empleado');
        router.push('/empleados');
    }
    finally {
        loading.value = false;
    }
};
// Check if mobile
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
};
// Lifecycle
onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (isEditing.value) {
        loadEmployee();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "employee-form-container" },
});
const __VLS_0 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: (__VLS_ctx.pageTitle),
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.pageTitle),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { 'header-extra': __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.go(-1);
        }
    };
    __VLS_7.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_7.slots;
        const __VLS_12 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        const __VLS_16 = {}.ArrowBackIcon;
        /** @type {[typeof __VLS_components.ArrowBackIcon, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
        const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
        var __VLS_15;
    }
    var __VLS_7;
}
const __VLS_20 = {}.NForm;
/** @type {[typeof __VLS_components.NForm, typeof __VLS_components.nForm, typeof __VLS_components.NForm, typeof __VLS_components.nForm, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    labelPlacement: "top",
    size: (__VLS_ctx.isMobile ? 'medium' : 'large'),
    showLabel: (!__VLS_ctx.isMobile),
}));
const __VLS_22 = __VLS_21({
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.formRules),
    labelPlacement: "top",
    size: (__VLS_ctx.isMobile ? 'medium' : 'large'),
    showLabel: (!__VLS_ctx.isMobile),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_24 = {};
__VLS_23.slots.default;
const __VLS_26 = {}.NTabs;
/** @type {[typeof __VLS_components.NTabs, typeof __VLS_components.nTabs, typeof __VLS_components.NTabs, typeof __VLS_components.nTabs, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    value: (__VLS_ctx.activeTab),
    type: "line",
    justifyContent: "center",
}));
const __VLS_28 = __VLS_27({
    value: (__VLS_ctx.activeTab),
    type: "line",
    justifyContent: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
__VLS_29.slots.default;
const __VLS_30 = {}.NTabPane;
/** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    name: "personal",
    tab: "Datos Personales",
}));
const __VLS_32 = __VLS_31({
    name: "personal",
    tab: "Datos Personales",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.NGrid;
/** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    cols: "1 s:2 m:3",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}));
const __VLS_36 = __VLS_35({
    cols: "1 s:2 m:3",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
const __VLS_38 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({}));
const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
const __VLS_42 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    label: "Nombres",
    path: "nombres",
}));
const __VLS_44 = __VLS_43({
    label: "Nombres",
    path: "nombres",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_45.slots.default;
const __VLS_46 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    value: (__VLS_ctx.formData.nombres),
    placeholder: "Juan",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_48 = __VLS_47({
    value: (__VLS_ctx.formData.nombres),
    placeholder: "Juan",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
var __VLS_45;
var __VLS_41;
const __VLS_50 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({}));
const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
const __VLS_54 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    label: "Apellido Paterno",
    path: "apellidoPaterno",
}));
const __VLS_56 = __VLS_55({
    label: "Apellido Paterno",
    path: "apellidoPaterno",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_57.slots.default;
const __VLS_58 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    value: (__VLS_ctx.formData.apellidoPaterno),
    placeholder: "Pérez",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_60 = __VLS_59({
    value: (__VLS_ctx.formData.apellidoPaterno),
    placeholder: "Pérez",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
var __VLS_57;
var __VLS_53;
const __VLS_62 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_65.slots.default;
const __VLS_66 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    label: "Apellido Materno",
    path: "apellidoMaterno",
}));
const __VLS_68 = __VLS_67({
    label: "Apellido Materno",
    path: "apellidoMaterno",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
const __VLS_70 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    value: (__VLS_ctx.formData.apellidoMaterno),
    placeholder: "García",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_72 = __VLS_71({
    value: (__VLS_ctx.formData.apellidoMaterno),
    placeholder: "García",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
var __VLS_69;
var __VLS_65;
const __VLS_74 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({}));
const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
__VLS_77.slots.default;
const __VLS_78 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
    label: "Tipo Documento",
    path: "tipoDocumento",
}));
const __VLS_80 = __VLS_79({
    label: "Tipo Documento",
    path: "tipoDocumento",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_81.slots.default;
const __VLS_82 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    value: (__VLS_ctx.formData.tipoDocumento),
    options: (__VLS_ctx.TIPO_DOCUMENTO_OPTIONS),
    placeholder: "Seleccionar tipo",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_84 = __VLS_83({
    value: (__VLS_ctx.formData.tipoDocumento),
    options: (__VLS_ctx.TIPO_DOCUMENTO_OPTIONS),
    placeholder: "Seleccionar tipo",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
var __VLS_81;
var __VLS_77;
const __VLS_86 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({}));
const __VLS_88 = __VLS_87({}, ...__VLS_functionalComponentArgsRest(__VLS_87));
__VLS_89.slots.default;
const __VLS_90 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    label: "Número de Documento",
    path: "numeroDocumento",
}));
const __VLS_92 = __VLS_91({
    label: "Número de Documento",
    path: "numeroDocumento",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
__VLS_93.slots.default;
const __VLS_94 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    ...{ 'onBlur': {} },
    value: (__VLS_ctx.formData.numeroDocumento),
    placeholder: "12345678",
    disabled: (__VLS_ctx.loading),
    maxlength: "8",
}));
const __VLS_96 = __VLS_95({
    ...{ 'onBlur': {} },
    value: (__VLS_ctx.formData.numeroDocumento),
    placeholder: "12345678",
    disabled: (__VLS_ctx.loading),
    maxlength: "8",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
let __VLS_98;
let __VLS_99;
let __VLS_100;
const __VLS_101 = {
    onBlur: (__VLS_ctx.validateDocument)
};
var __VLS_97;
var __VLS_93;
var __VLS_89;
const __VLS_102 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({}));
const __VLS_104 = __VLS_103({}, ...__VLS_functionalComponentArgsRest(__VLS_103));
__VLS_105.slots.default;
const __VLS_106 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    label: "Fecha de Nacimiento",
    path: "fechaNacimiento",
}));
const __VLS_108 = __VLS_107({
    label: "Fecha de Nacimiento",
    path: "fechaNacimiento",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
const __VLS_110 = {}.NDatePicker;
/** @type {[typeof __VLS_components.NDatePicker, typeof __VLS_components.nDatePicker, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    value: (__VLS_ctx.formData.fechaNacimiento),
    type: "date",
    format: "dd/MM/yyyy",
    disabled: (__VLS_ctx.loading),
    ...{ style: {} },
}));
const __VLS_112 = __VLS_111({
    value: (__VLS_ctx.formData.fechaNacimiento),
    type: "date",
    format: "dd/MM/yyyy",
    disabled: (__VLS_ctx.loading),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
var __VLS_109;
var __VLS_105;
const __VLS_114 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({}));
const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
const __VLS_118 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    label: "Lugar de Nacimiento",
}));
const __VLS_120 = __VLS_119({
    label: "Lugar de Nacimiento",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
const __VLS_122 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    value: (__VLS_ctx.formData.lugarNacimiento),
    placeholder: "Lima, Perú",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_124 = __VLS_123({
    value: (__VLS_ctx.formData.lugarNacimiento),
    placeholder: "Lima, Perú",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
var __VLS_121;
var __VLS_117;
const __VLS_126 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({}));
const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
__VLS_129.slots.default;
const __VLS_130 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    label: "Sexo",
}));
const __VLS_132 = __VLS_131({
    label: "Sexo",
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
__VLS_133.slots.default;
const __VLS_134 = {}.NRadioGroup;
/** @type {[typeof __VLS_components.NRadioGroup, typeof __VLS_components.nRadioGroup, typeof __VLS_components.NRadioGroup, typeof __VLS_components.nRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    value: (__VLS_ctx.formData.sexo),
    disabled: (__VLS_ctx.loading),
}));
const __VLS_136 = __VLS_135({
    value: (__VLS_ctx.formData.sexo),
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
__VLS_137.slots.default;
const __VLS_138 = {}.NRadioButton;
/** @type {[typeof __VLS_components.NRadioButton, typeof __VLS_components.nRadioButton, typeof __VLS_components.NRadioButton, typeof __VLS_components.nRadioButton, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    value: "M",
}));
const __VLS_140 = __VLS_139({
    value: "M",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
__VLS_141.slots.default;
var __VLS_141;
const __VLS_142 = {}.NRadioButton;
/** @type {[typeof __VLS_components.NRadioButton, typeof __VLS_components.nRadioButton, typeof __VLS_components.NRadioButton, typeof __VLS_components.nRadioButton, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    value: "F",
}));
const __VLS_144 = __VLS_143({
    value: "F",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
__VLS_145.slots.default;
var __VLS_145;
var __VLS_137;
var __VLS_133;
var __VLS_129;
const __VLS_146 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({}));
const __VLS_148 = __VLS_147({}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
const __VLS_150 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    label: "Estado Civil",
}));
const __VLS_152 = __VLS_151({
    label: "Estado Civil",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
__VLS_153.slots.default;
const __VLS_154 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    value: (__VLS_ctx.formData.estadoCivil),
    options: (__VLS_ctx.ESTADO_CIVIL_OPTIONS),
    placeholder: "Seleccionar estado",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}));
const __VLS_156 = __VLS_155({
    value: (__VLS_ctx.formData.estadoCivil),
    options: (__VLS_ctx.ESTADO_CIVIL_OPTIONS),
    placeholder: "Seleccionar estado",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
var __VLS_153;
var __VLS_149;
const __VLS_158 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({}));
const __VLS_160 = __VLS_159({}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
const __VLS_162 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    label: "Nacionalidad",
}));
const __VLS_164 = __VLS_163({
    label: "Nacionalidad",
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
const __VLS_166 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
    value: (__VLS_ctx.formData.nacionalidad),
    placeholder: "Peruana",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_168 = __VLS_167({
    value: (__VLS_ctx.formData.nacionalidad),
    placeholder: "Peruana",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
var __VLS_165;
var __VLS_161;
const __VLS_170 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({}));
const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
__VLS_173.slots.default;
const __VLS_174 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
    label: "Número de Hijos",
}));
const __VLS_176 = __VLS_175({
    label: "Número de Hijos",
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
__VLS_177.slots.default;
const __VLS_178 = {}.NInputNumber;
/** @type {[typeof __VLS_components.NInputNumber, typeof __VLS_components.nInputNumber, ]} */ ;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
    value: (__VLS_ctx.formData.hijos),
    min: (0),
    max: (20),
    ...{ style: {} },
    disabled: (__VLS_ctx.loading),
}));
const __VLS_180 = __VLS_179({
    value: (__VLS_ctx.formData.hijos),
    min: (0),
    max: (20),
    ...{ style: {} },
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
var __VLS_177;
var __VLS_173;
const __VLS_182 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({}));
const __VLS_184 = __VLS_183({}, ...__VLS_functionalComponentArgsRest(__VLS_183));
__VLS_185.slots.default;
const __VLS_186 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
    label: "Nivel Educativo",
}));
const __VLS_188 = __VLS_187({
    label: "Nivel Educativo",
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
__VLS_189.slots.default;
const __VLS_190 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
    value: (__VLS_ctx.formData.nivelEducativo),
    options: (__VLS_ctx.NIVEL_EDUCATIVO_OPTIONS),
    placeholder: "Seleccionar nivel",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}));
const __VLS_192 = __VLS_191({
    value: (__VLS_ctx.formData.nivelEducativo),
    options: (__VLS_ctx.NIVEL_EDUCATIVO_OPTIONS),
    placeholder: "Seleccionar nivel",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
var __VLS_189;
var __VLS_185;
const __VLS_194 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({}));
const __VLS_196 = __VLS_195({}, ...__VLS_functionalComponentArgsRest(__VLS_195));
__VLS_197.slots.default;
const __VLS_198 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
    label: "Profesión",
}));
const __VLS_200 = __VLS_199({
    label: "Profesión",
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
__VLS_201.slots.default;
const __VLS_202 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
    value: (__VLS_ctx.formData.profesion),
    placeholder: "Ingeniero de Sistemas",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_204 = __VLS_203({
    value: (__VLS_ctx.formData.profesion),
    placeholder: "Ingeniero de Sistemas",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
var __VLS_201;
var __VLS_197;
var __VLS_37;
const __VLS_206 = {}.NDivider;
/** @type {[typeof __VLS_components.NDivider, typeof __VLS_components.nDivider, typeof __VLS_components.NDivider, typeof __VLS_components.nDivider, ]} */ ;
// @ts-ignore
const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({}));
const __VLS_208 = __VLS_207({}, ...__VLS_functionalComponentArgsRest(__VLS_207));
__VLS_209.slots.default;
var __VLS_209;
const __VLS_210 = {}.NGrid;
/** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */ ;
// @ts-ignore
const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}));
const __VLS_212 = __VLS_211({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_211));
__VLS_213.slots.default;
const __VLS_214 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({}));
const __VLS_216 = __VLS_215({}, ...__VLS_functionalComponentArgsRest(__VLS_215));
__VLS_217.slots.default;
const __VLS_218 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
    label: "Dirección",
}));
const __VLS_220 = __VLS_219({
    label: "Dirección",
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
__VLS_221.slots.default;
const __VLS_222 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({
    value: (__VLS_ctx.formData.direccion),
    placeholder: "Av. Principal 123",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_224 = __VLS_223({
    value: (__VLS_ctx.formData.direccion),
    placeholder: "Av. Principal 123",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_223));
var __VLS_221;
var __VLS_217;
const __VLS_226 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({}));
const __VLS_228 = __VLS_227({}, ...__VLS_functionalComponentArgsRest(__VLS_227));
__VLS_229.slots.default;
const __VLS_230 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
    label: "Departamento",
}));
const __VLS_232 = __VLS_231({
    label: "Departamento",
}, ...__VLS_functionalComponentArgsRest(__VLS_231));
__VLS_233.slots.default;
const __VLS_234 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
    value: (__VLS_ctx.formData.departamento),
    options: (__VLS_ctx.departmentOptions),
    placeholder: "Lima",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_236 = __VLS_235({
    value: (__VLS_ctx.formData.departamento),
    options: (__VLS_ctx.departmentOptions),
    placeholder: "Lima",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_235));
var __VLS_233;
var __VLS_229;
const __VLS_238 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({}));
const __VLS_240 = __VLS_239({}, ...__VLS_functionalComponentArgsRest(__VLS_239));
__VLS_241.slots.default;
const __VLS_242 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
    label: "Provincia",
}));
const __VLS_244 = __VLS_243({
    label: "Provincia",
}, ...__VLS_functionalComponentArgsRest(__VLS_243));
__VLS_245.slots.default;
const __VLS_246 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
    value: (__VLS_ctx.formData.provincia),
    options: (__VLS_ctx.provinceOptions),
    placeholder: "Lima",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_248 = __VLS_247({
    value: (__VLS_ctx.formData.provincia),
    options: (__VLS_ctx.provinceOptions),
    placeholder: "Lima",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_247));
var __VLS_245;
var __VLS_241;
const __VLS_250 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({}));
const __VLS_252 = __VLS_251({}, ...__VLS_functionalComponentArgsRest(__VLS_251));
__VLS_253.slots.default;
const __VLS_254 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
    label: "Distrito",
}));
const __VLS_256 = __VLS_255({
    label: "Distrito",
}, ...__VLS_functionalComponentArgsRest(__VLS_255));
__VLS_257.slots.default;
const __VLS_258 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
    value: (__VLS_ctx.formData.distrito),
    options: (__VLS_ctx.districtOptions),
    placeholder: "San Borja",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_260 = __VLS_259({
    value: (__VLS_ctx.formData.distrito),
    options: (__VLS_ctx.districtOptions),
    placeholder: "San Borja",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
var __VLS_257;
var __VLS_253;
const __VLS_262 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({}));
const __VLS_264 = __VLS_263({}, ...__VLS_functionalComponentArgsRest(__VLS_263));
__VLS_265.slots.default;
const __VLS_266 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
    label: "Teléfono",
}));
const __VLS_268 = __VLS_267({
    label: "Teléfono",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
__VLS_269.slots.default;
const __VLS_270 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
    value: (__VLS_ctx.formData.telefono),
    placeholder: "999 123 456",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_272 = __VLS_271({
    value: (__VLS_ctx.formData.telefono),
    placeholder: "999 123 456",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_271));
var __VLS_269;
var __VLS_265;
const __VLS_274 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({}));
const __VLS_276 = __VLS_275({}, ...__VLS_functionalComponentArgsRest(__VLS_275));
__VLS_277.slots.default;
const __VLS_278 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
    label: "Email Personal",
}));
const __VLS_280 = __VLS_279({
    label: "Email Personal",
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
__VLS_281.slots.default;
const __VLS_282 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
    value: (__VLS_ctx.formData.email),
    placeholder: "correo@ejemplo.com",
    type: "email",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_284 = __VLS_283({
    value: (__VLS_ctx.formData.email),
    placeholder: "correo@ejemplo.com",
    type: "email",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_283));
var __VLS_281;
var __VLS_277;
const __VLS_286 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
    span: (2),
}));
const __VLS_288 = __VLS_287({
    span: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_287));
__VLS_289.slots.default;
const __VLS_290 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
    label: "Email Corporativo",
}));
const __VLS_292 = __VLS_291({
    label: "Email Corporativo",
}, ...__VLS_functionalComponentArgsRest(__VLS_291));
__VLS_293.slots.default;
const __VLS_294 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
    value: (__VLS_ctx.formData.emailCorporativo),
    placeholder: "nombre@empresa.com",
    type: "email",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_296 = __VLS_295({
    value: (__VLS_ctx.formData.emailCorporativo),
    placeholder: "nombre@empresa.com",
    type: "email",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
var __VLS_293;
var __VLS_289;
var __VLS_213;
var __VLS_33;
const __VLS_298 = {}.NTabPane;
/** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
// @ts-ignore
const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({
    name: "banking",
    tab: "Datos Bancarios",
}));
const __VLS_300 = __VLS_299({
    name: "banking",
    tab: "Datos Bancarios",
}, ...__VLS_functionalComponentArgsRest(__VLS_299));
__VLS_301.slots.default;
const __VLS_302 = {}.NGrid;
/** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */ ;
// @ts-ignore
const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}));
const __VLS_304 = __VLS_303({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_303));
__VLS_305.slots.default;
const __VLS_306 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({}));
const __VLS_308 = __VLS_307({}, ...__VLS_functionalComponentArgsRest(__VLS_307));
__VLS_309.slots.default;
const __VLS_310 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({
    label: "Banco",
}));
const __VLS_312 = __VLS_311({
    label: "Banco",
}, ...__VLS_functionalComponentArgsRest(__VLS_311));
__VLS_313.slots.default;
const __VLS_314 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
    value: (__VLS_ctx.formData.banco),
    options: (__VLS_ctx.bankOptions),
    placeholder: "Seleccionar banco",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}));
const __VLS_316 = __VLS_315({
    value: (__VLS_ctx.formData.banco),
    options: (__VLS_ctx.bankOptions),
    placeholder: "Seleccionar banco",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_315));
var __VLS_313;
var __VLS_309;
const __VLS_318 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_319 = __VLS_asFunctionalComponent(__VLS_318, new __VLS_318({}));
const __VLS_320 = __VLS_319({}, ...__VLS_functionalComponentArgsRest(__VLS_319));
__VLS_321.slots.default;
const __VLS_322 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({
    label: "Tipo de Cuenta",
}));
const __VLS_324 = __VLS_323({
    label: "Tipo de Cuenta",
}, ...__VLS_functionalComponentArgsRest(__VLS_323));
__VLS_325.slots.default;
const __VLS_326 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_327 = __VLS_asFunctionalComponent(__VLS_326, new __VLS_326({
    value: (__VLS_ctx.formData.tipoCuenta),
    options: (__VLS_ctx.TIPO_CUENTA_OPTIONS),
    placeholder: "Seleccionar tipo",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}));
const __VLS_328 = __VLS_327({
    value: (__VLS_ctx.formData.tipoCuenta),
    options: (__VLS_ctx.TIPO_CUENTA_OPTIONS),
    placeholder: "Seleccionar tipo",
    clearable: true,
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_327));
var __VLS_325;
var __VLS_321;
const __VLS_330 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_331 = __VLS_asFunctionalComponent(__VLS_330, new __VLS_330({}));
const __VLS_332 = __VLS_331({}, ...__VLS_functionalComponentArgsRest(__VLS_331));
__VLS_333.slots.default;
const __VLS_334 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({
    label: "Número de Cuenta",
}));
const __VLS_336 = __VLS_335({
    label: "Número de Cuenta",
}, ...__VLS_functionalComponentArgsRest(__VLS_335));
__VLS_337.slots.default;
const __VLS_338 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_339 = __VLS_asFunctionalComponent(__VLS_338, new __VLS_338({
    value: (__VLS_ctx.formData.numeroCuenta),
    placeholder: "194-12345678-0-12",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_340 = __VLS_339({
    value: (__VLS_ctx.formData.numeroCuenta),
    placeholder: "194-12345678-0-12",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_339));
var __VLS_337;
var __VLS_333;
const __VLS_342 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({}));
const __VLS_344 = __VLS_343({}, ...__VLS_functionalComponentArgsRest(__VLS_343));
__VLS_345.slots.default;
const __VLS_346 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_347 = __VLS_asFunctionalComponent(__VLS_346, new __VLS_346({
    label: "CCI (Código Interbancario)",
}));
const __VLS_348 = __VLS_347({
    label: "CCI (Código Interbancario)",
}, ...__VLS_functionalComponentArgsRest(__VLS_347));
__VLS_349.slots.default;
const __VLS_350 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({
    value: (__VLS_ctx.formData.numeroCCI),
    placeholder: "002-194-000123456789-12",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_352 = __VLS_351({
    value: (__VLS_ctx.formData.numeroCCI),
    placeholder: "002-194-000123456789-12",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_351));
var __VLS_349;
var __VLS_345;
var __VLS_305;
var __VLS_301;
const __VLS_354 = {}.NTabPane;
/** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
// @ts-ignore
const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({
    name: "laboral",
    tab: "Datos Laborales",
}));
const __VLS_356 = __VLS_355({
    name: "laboral",
    tab: "Datos Laborales",
}, ...__VLS_functionalComponentArgsRest(__VLS_355));
__VLS_357.slots.default;
const __VLS_358 = {}.NGrid;
/** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */ ;
// @ts-ignore
const __VLS_359 = __VLS_asFunctionalComponent(__VLS_358, new __VLS_358({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}));
const __VLS_360 = __VLS_359({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_359));
__VLS_361.slots.default;
const __VLS_362 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({}));
const __VLS_364 = __VLS_363({}, ...__VLS_functionalComponentArgsRest(__VLS_363));
__VLS_365.slots.default;
const __VLS_366 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_367 = __VLS_asFunctionalComponent(__VLS_366, new __VLS_366({
    label: "Fecha de Ingreso",
    path: "fechaIngreso",
}));
const __VLS_368 = __VLS_367({
    label: "Fecha de Ingreso",
    path: "fechaIngreso",
}, ...__VLS_functionalComponentArgsRest(__VLS_367));
__VLS_369.slots.default;
const __VLS_370 = {}.NDatePicker;
/** @type {[typeof __VLS_components.NDatePicker, typeof __VLS_components.nDatePicker, ]} */ ;
// @ts-ignore
const __VLS_371 = __VLS_asFunctionalComponent(__VLS_370, new __VLS_370({
    value: (__VLS_ctx.formData.fechaIngreso),
    type: "date",
    format: "dd/MM/yyyy",
    disabled: (__VLS_ctx.loading),
    ...{ style: {} },
}));
const __VLS_372 = __VLS_371({
    value: (__VLS_ctx.formData.fechaIngreso),
    type: "date",
    format: "dd/MM/yyyy",
    disabled: (__VLS_ctx.loading),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_371));
var __VLS_369;
var __VLS_365;
const __VLS_374 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_375 = __VLS_asFunctionalComponent(__VLS_374, new __VLS_374({}));
const __VLS_376 = __VLS_375({}, ...__VLS_functionalComponentArgsRest(__VLS_375));
__VLS_377.slots.default;
const __VLS_378 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_379 = __VLS_asFunctionalComponent(__VLS_378, new __VLS_378({
    label: "Puesto",
}));
const __VLS_380 = __VLS_379({
    label: "Puesto",
}, ...__VLS_functionalComponentArgsRest(__VLS_379));
__VLS_381.slots.default;
const __VLS_382 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({
    value: (__VLS_ctx.formData.puesto),
    placeholder: "Desarrollador Senior",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_384 = __VLS_383({
    value: (__VLS_ctx.formData.puesto),
    placeholder: "Desarrollador Senior",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_383));
var __VLS_381;
var __VLS_377;
const __VLS_386 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_387 = __VLS_asFunctionalComponent(__VLS_386, new __VLS_386({}));
const __VLS_388 = __VLS_387({}, ...__VLS_functionalComponentArgsRest(__VLS_387));
__VLS_389.slots.default;
const __VLS_390 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_391 = __VLS_asFunctionalComponent(__VLS_390, new __VLS_390({
    label: "Departamento de Trabajo",
}));
const __VLS_392 = __VLS_391({
    label: "Departamento de Trabajo",
}, ...__VLS_functionalComponentArgsRest(__VLS_391));
__VLS_393.slots.default;
const __VLS_394 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_395 = __VLS_asFunctionalComponent(__VLS_394, new __VLS_394({
    value: (__VLS_ctx.formData.departamentoTrabajo),
    placeholder: "Tecnología",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_396 = __VLS_395({
    value: (__VLS_ctx.formData.departamentoTrabajo),
    placeholder: "Tecnología",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_395));
var __VLS_393;
var __VLS_389;
const __VLS_398 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_399 = __VLS_asFunctionalComponent(__VLS_398, new __VLS_398({}));
const __VLS_400 = __VLS_399({}, ...__VLS_functionalComponentArgsRest(__VLS_399));
__VLS_401.slots.default;
const __VLS_402 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
    label: "Área de Trabajo",
}));
const __VLS_404 = __VLS_403({
    label: "Área de Trabajo",
}, ...__VLS_functionalComponentArgsRest(__VLS_403));
__VLS_405.slots.default;
const __VLS_406 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_407 = __VLS_asFunctionalComponent(__VLS_406, new __VLS_406({
    value: (__VLS_ctx.formData.areaTrabajo),
    placeholder: "Desarrollo Web",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_408 = __VLS_407({
    value: (__VLS_ctx.formData.areaTrabajo),
    placeholder: "Desarrollo Web",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_407));
var __VLS_405;
var __VLS_401;
const __VLS_410 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_411 = __VLS_asFunctionalComponent(__VLS_410, new __VLS_410({}));
const __VLS_412 = __VLS_411({}, ...__VLS_functionalComponentArgsRest(__VLS_411));
__VLS_413.slots.default;
const __VLS_414 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_415 = __VLS_asFunctionalComponent(__VLS_414, new __VLS_414({
    label: "Licencia de Conducir",
}));
const __VLS_416 = __VLS_415({
    label: "Licencia de Conducir",
}, ...__VLS_functionalComponentArgsRest(__VLS_415));
__VLS_417.slots.default;
const __VLS_418 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({
    value: (__VLS_ctx.formData.licenciaConducir),
    placeholder: "A1 - Motos",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_420 = __VLS_419({
    value: (__VLS_ctx.formData.licenciaConducir),
    placeholder: "A1 - Motos",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_419));
var __VLS_417;
var __VLS_413;
const __VLS_422 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({}));
const __VLS_424 = __VLS_423({}, ...__VLS_functionalComponentArgsRest(__VLS_423));
__VLS_425.slots.default;
const __VLS_426 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_427 = __VLS_asFunctionalComponent(__VLS_426, new __VLS_426({
    label: "Estado",
    path: "estado",
}));
const __VLS_428 = __VLS_427({
    label: "Estado",
    path: "estado",
}, ...__VLS_functionalComponentArgsRest(__VLS_427));
__VLS_429.slots.default;
const __VLS_430 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
    value: (__VLS_ctx.formData.estado),
    options: (__VLS_ctx.ESTADO_EMPLEADO_OPTIONS),
    placeholder: "Seleccionar estado",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_432 = __VLS_431({
    value: (__VLS_ctx.formData.estado),
    options: (__VLS_ctx.ESTADO_EMPLEADO_OPTIONS),
    placeholder: "Seleccionar estado",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_431));
var __VLS_429;
var __VLS_425;
var __VLS_361;
var __VLS_357;
const __VLS_434 = {}.NTabPane;
/** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
// @ts-ignore
const __VLS_435 = __VLS_asFunctionalComponent(__VLS_434, new __VLS_434({
    name: "documents",
    tab: "Documentos",
}));
const __VLS_436 = __VLS_435({
    name: "documents",
    tab: "Documentos",
}, ...__VLS_functionalComponentArgsRest(__VLS_435));
__VLS_437.slots.default;
const __VLS_438 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
// @ts-ignore
const __VLS_439 = __VLS_asFunctionalComponent(__VLS_438, new __VLS_438({
    vertical: true,
    size: "large",
}));
const __VLS_440 = __VLS_439({
    vertical: true,
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_439));
__VLS_441.slots.default;
const __VLS_442 = {}.NGrid;
/** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */ ;
// @ts-ignore
const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}));
const __VLS_444 = __VLS_443({
    cols: "1 s:2 m:2",
    responsive: "screen",
    xGap: (24),
    yGap: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_443));
__VLS_445.slots.default;
const __VLS_446 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_447 = __VLS_asFunctionalComponent(__VLS_446, new __VLS_446({}));
const __VLS_448 = __VLS_447({}, ...__VLS_functionalComponentArgsRest(__VLS_447));
__VLS_449.slots.default;
const __VLS_450 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_451 = __VLS_asFunctionalComponent(__VLS_450, new __VLS_450({
    label: "Foto del Empleado",
}));
const __VLS_452 = __VLS_451({
    label: "Foto del Empleado",
}, ...__VLS_functionalComponentArgsRest(__VLS_451));
__VLS_453.slots.default;
const __VLS_454 = {}.NUpload;
/** @type {[typeof __VLS_components.NUpload, typeof __VLS_components.nUpload, typeof __VLS_components.NUpload, typeof __VLS_components.nUpload, ]} */ ;
// @ts-ignore
const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({
    ...{ 'onUpdate:fileList': {} },
    defaultFileList: (__VLS_ctx.fotoFileList),
    max: (1),
    listType: "image-card",
}));
const __VLS_456 = __VLS_455({
    ...{ 'onUpdate:fileList': {} },
    defaultFileList: (__VLS_ctx.fotoFileList),
    max: (1),
    listType: "image-card",
}, ...__VLS_functionalComponentArgsRest(__VLS_455));
let __VLS_458;
let __VLS_459;
let __VLS_460;
const __VLS_461 = {
    'onUpdate:fileList': (__VLS_ctx.handleFotoUpload)
};
__VLS_457.slots.default;
var __VLS_457;
var __VLS_453;
var __VLS_449;
const __VLS_462 = {}.NGridItem;
/** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
// @ts-ignore
const __VLS_463 = __VLS_asFunctionalComponent(__VLS_462, new __VLS_462({}));
const __VLS_464 = __VLS_463({}, ...__VLS_functionalComponentArgsRest(__VLS_463));
__VLS_465.slots.default;
const __VLS_466 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_467 = __VLS_asFunctionalComponent(__VLS_466, new __VLS_466({
    label: "Foto del DNI",
}));
const __VLS_468 = __VLS_467({
    label: "Foto del DNI",
}, ...__VLS_functionalComponentArgsRest(__VLS_467));
__VLS_469.slots.default;
const __VLS_470 = {}.NUpload;
/** @type {[typeof __VLS_components.NUpload, typeof __VLS_components.nUpload, typeof __VLS_components.NUpload, typeof __VLS_components.nUpload, ]} */ ;
// @ts-ignore
const __VLS_471 = __VLS_asFunctionalComponent(__VLS_470, new __VLS_470({
    ...{ 'onUpdate:fileList': {} },
    defaultFileList: (__VLS_ctx.dniFileList),
    max: (1),
}));
const __VLS_472 = __VLS_471({
    ...{ 'onUpdate:fileList': {} },
    defaultFileList: (__VLS_ctx.dniFileList),
    max: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_471));
let __VLS_474;
let __VLS_475;
let __VLS_476;
const __VLS_477 = {
    'onUpdate:fileList': (__VLS_ctx.handleDNIUpload)
};
__VLS_473.slots.default;
const __VLS_478 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
const __VLS_479 = __VLS_asFunctionalComponent(__VLS_478, new __VLS_478({}));
const __VLS_480 = __VLS_479({}, ...__VLS_functionalComponentArgsRest(__VLS_479));
__VLS_481.slots.default;
var __VLS_481;
var __VLS_473;
var __VLS_469;
var __VLS_465;
var __VLS_445;
var __VLS_441;
var __VLS_437;
var __VLS_29;
var __VLS_23;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_482 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    const __VLS_483 = __VLS_asFunctionalComponent(__VLS_482, new __VLS_482({
        justify: "end",
        size: "large",
    }));
    const __VLS_484 = __VLS_483({
        justify: "end",
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_483));
    __VLS_485.slots.default;
    const __VLS_486 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_487 = __VLS_asFunctionalComponent(__VLS_486, new __VLS_486({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.loading),
    }));
    const __VLS_488 = __VLS_487({
        ...{ 'onClick': {} },
        disabled: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_487));
    let __VLS_490;
    let __VLS_491;
    let __VLS_492;
    const __VLS_493 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.go(-1);
        }
    };
    __VLS_489.slots.default;
    var __VLS_489;
    const __VLS_494 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_495 = __VLS_asFunctionalComponent(__VLS_494, new __VLS_494({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_496 = __VLS_495({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_495));
    let __VLS_498;
    let __VLS_499;
    let __VLS_500;
    const __VLS_501 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    __VLS_497.slots.default;
    (__VLS_ctx.isEditing ? 'Actualizar' : 'Crear');
    var __VLS_497;
    var __VLS_485;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['employee-form-container']} */ ;
// @ts-ignore
var __VLS_25 = __VLS_24;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowBackIcon: ArrowBackIcon,
            TIPO_DOCUMENTO_OPTIONS: TIPO_DOCUMENTO_OPTIONS,
            ESTADO_CIVIL_OPTIONS: ESTADO_CIVIL_OPTIONS,
            NIVEL_EDUCATIVO_OPTIONS: NIVEL_EDUCATIVO_OPTIONS,
            TIPO_CUENTA_OPTIONS: TIPO_CUENTA_OPTIONS,
            ESTADO_EMPLEADO_OPTIONS: ESTADO_EMPLEADO_OPTIONS,
            formRef: formRef,
            loading: loading,
            activeTab: activeTab,
            isMobile: isMobile,
            isEditing: isEditing,
            pageTitle: pageTitle,
            formData: formData,
            fotoFileList: fotoFileList,
            dniFileList: dniFileList,
            departmentOptions: departmentOptions,
            provinceOptions: provinceOptions,
            districtOptions: districtOptions,
            bankOptions: bankOptions,
            formRules: formRules,
            validateDocument: validateDocument,
            handleFotoUpload: handleFotoUpload,
            handleDNIUpload: handleDNIUpload,
            handleSubmit: handleSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
