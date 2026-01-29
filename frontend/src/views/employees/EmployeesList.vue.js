import { ref, reactive, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, useDialog } from 'naive-ui';
import { AddIcon, RefreshIcon, EditIcon, DeleteIcon, EyeIcon } from '@vicons/ionicons5';
import { ESTADO_EMPLEADO_OPTIONS } from '@/types/employee.types';
import { debounce } from 'lodash-es';
import api from '@/services/api';
const router = useRouter();
const message = useMessage();
const dialog = useDialog();
// Reactive data
const loading = ref(false);
const employees = ref([]);
const error = ref('');
const filters = reactive({
    search: '',
    estado: '',
    departamento: ''
});
const pagination = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100]
});
// Mock department options (reemplazar con API real)
const departmentOptions = [
    { label: 'Tecnología', value: 'Tecnología' },
    { label: 'Recursos Humanos', value: 'Recursos Humanos' },
    { label: 'Contabilidad', value: 'Contabilidad' },
    { label: 'Ventas', value: 'Ventas' },
    { label: 'Logística', value: 'Logística' }
];
// Columnas de la tabla
const columns = [
    {
        title: 'Foto',
        key: 'foto',
        width: 60,
        render(row) {
            return h('div', { class: 'employee-avatar' }, [
                h('img', {
                    src: row.foto || '/default-avatar.png',
                    alt: row.nombreCompleto,
                    class: 'avatar-img',
                    onError: (e) => {
                        const target = e.target;
                        target.src = '/default-avatar.png';
                    }
                })
            ]);
        }
    },
    {
        title: 'Empleado',
        key: 'nombreCompleto',
        width: 200,
        render(row) {
            return h('div', { class: 'employee-info' }, [
                h('div', { class: 'employee-name' }, row.nombreCompleto),
                h('div', { class: 'employee-dni' }, `DNI: ${row.numeroDocumento}`)
            ]);
        }
    },
    {
        title: 'Contacto',
        key: 'contacto',
        width: 150,
        render(row) {
            return h('div', { class: 'contact-info' }, [
                h('div', { class: 'contact-item' }, row.email || 'Sin email'),
                h('div', { class: 'contact-item' }, row.telefono || 'Sin teléfono')
            ]);
        }
    },
    {
        title: 'Puesto',
        key: 'puesto',
        width: 120,
        render(row) {
            return h('span', row.currentContract?.puesto || 'Sin contrato');
        }
    },
    {
        title: 'Fecha Ingreso',
        key: 'fechaIngreso',
        width: 120,
        render(row) {
            return formatDate(row.fechaIngreso);
        }
    },
    {
        title: 'Estado',
        key: 'estado',
        width: 100,
        render(row) {
            const type = getStatusType(row.estado);
            return h('n-tag', {
                type,
                size: 'small'
            }, () => row.estado);
        }
    },
    {
        title: 'Acciones',
        key: 'actions',
        width: 120,
        render(row) {
            return h('div', { class: 'action-buttons' }, [
                h('n-button', {
                    circle: true,
                    size: 'small',
                    quaternary: true,
                    onClick: () => viewEmployee(row.id)
                }, () => h(EyeIcon)),
                h('n-button', {
                    circle: true,
                    size: 'small',
                    quaternary: true,
                    onClick: () => editEmployee(row.id)
                }, () => h(EditIcon)),
                h('n-button', {
                    circle: true,
                    size: 'small',
                    quaternary: true,
                    type: 'error',
                    onClick: () => confirmDelete(row)
                }, () => h(DeleteIcon))
            ]);
        }
    }
];
// Methods
const formatDate = (date) => {
    if (!date)
        return 'N/A';
    return new Date(date).toLocaleDateString('es-PE');
};
const getStatusType = (status) => {
    const types = {
        'ACTIVO': 'success',
        'INACTIVO': 'error',
        'SUSPENDIDO': 'warning',
        'CESADO': 'default'
    };
    return types[status] || 'default';
};
const loadEmployees = async () => {
    loading.value = true;
    try {
        // Llamada a API real
        const response = await api.get('/employees');
        if (response.data.success) {
            employees.value = response.data.data || [];
        }
        else {
            throw new Error(response.data.error || 'Error en la API');
        }
        // Aplicar filtros en el cliente
        let filteredEmployees = [...employees.value];
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredEmployees = filteredEmployees.filter(emp => emp.nombreCompleto?.toLowerCase().includes(searchTerm) ||
                emp.numeroDocumento?.includes(searchTerm) ||
                (emp.currentContract?.puesto || '').toLowerCase().includes(searchTerm));
        }
        if (filters.estado) {
            filteredEmployees = filteredEmployees.filter(emp => emp.estado === filters.estado);
        }
        if (filters.departamento) {
            filteredEmployees = filteredEmployees.filter(emp => emp.currentContract?.departamentoTrabajo === filters.departamento);
        }
        // Actualizar datos paginados
        pagination.itemCount = filteredEmployees.length;
        // Para paginación, tomar solo los elementos de la página actual
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        // Actualizar el array de empleados con datos paginados
        employees.value = filteredEmployees.slice(startIndex, endIndex);
    }
    catch (err) {
        message.error('Error al cargar empleados');
        console.error('Load employees error:', err);
        // Fallback a datos mock si hay error
        employees.value = [];
        pagination.itemCount = 0;
    }
    finally {
        loading.value = false;
    }
};
const debouncedSearch = debounce(loadEmployees, 300);
const refreshData = () => {
    loadEmployees();
};
const clearFilters = () => {
    Object.assign(filters, {
        search: '',
        estado: '',
        departamento: ''
    });
    pagination.page = 1;
    loadEmployees();
};
const viewEmployee = (id) => {
    router.push(`/empleados/${id}`);
};
const editEmployee = (id) => {
    router.push(`/empleados/${id}/edit`);
};
const confirmDelete = (employee) => {
    dialog.warning({
        title: 'Eliminar Empleado',
        content: `¿Estás seguro de que deseas eliminar a ${employee.nombreCompleto}? Esta acción no se puede deshacer.`,
        positiveText: 'Eliminar',
        negativeText: 'Cancelar',
        onPositiveClick: async () => {
            try {
                // TODO: Implementar delete API
                await api.delete(`/employees/${employee.id}`);
                message.success('Empleado eliminado exitosamente');
                loadEmployees();
            }
            catch (error) {
                message.error('Error al eliminar empleado');
            }
        }
    });
};
const handlePageChange = (page) => {
    pagination.page = page;
    loadEmployees();
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadEmployees();
};
// Load initial data
loadEmployees();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['contact-info']} */ ;
/** @type {__VLS_StyleScopedClasses['employee-info']} */ ;
/** @type {__VLS_StyleScopedClasses['employee-dni']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "contracts-container" },
});
const __VLS_0 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "Gestión de Empleados",
}));
const __VLS_2 = __VLS_1({
    title: "Gestión de Empleados",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { 'header-extra': __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (__VLS_ctx.refreshData)
    };
    __VLS_11.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_11.slots;
        const __VLS_16 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
        const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_19.slots.default;
        const __VLS_20 = {}.RefreshIcon;
        /** @type {[typeof __VLS_components.RefreshIcon, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        var __VLS_19;
    }
    var __VLS_11;
    const __VLS_24 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/empleados/nuevo');
        }
    };
    __VLS_27.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_32 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        const __VLS_36 = {}.AddIcon;
        /** @type {[typeof __VLS_components.AddIcon, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        var __VLS_35;
    }
    var __VLS_27;
    var __VLS_7;
}
const __VLS_40 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    vertical: true,
    size: "large",
}));
const __VLS_42 = __VLS_41({
    vertical: true,
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    size: "small",
    title: "Filtros",
}));
const __VLS_46 = __VLS_45({
    size: "small",
    title: "Filtros",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.NForm;
/** @type {[typeof __VLS_components.NForm, typeof __VLS_components.nForm, typeof __VLS_components.NForm, typeof __VLS_components.nForm, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    inline: true,
    model: (__VLS_ctx.filters),
    labelPlacement: "left",
}));
const __VLS_50 = __VLS_49({
    inline: true,
    model: (__VLS_ctx.filters),
    labelPlacement: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "Buscar",
}));
const __VLS_54 = __VLS_53({
    label: "Buscar",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onInput': {} },
    value: (__VLS_ctx.filters.search),
    placeholder: "Nombre, DNI, puesto...",
    clearable: true,
}));
const __VLS_58 = __VLS_57({
    ...{ 'onInput': {} },
    value: (__VLS_ctx.filters.search),
    placeholder: "Nombre, DNI, puesto...",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onInput: (__VLS_ctx.debouncedSearch)
};
var __VLS_59;
var __VLS_55;
const __VLS_64 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "Estado",
}));
const __VLS_66 = __VLS_65({
    label: "Estado",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.estado),
    options: (__VLS_ctx.ESTADO_EMPLEADO_OPTIONS),
    placeholder: "Todos los estados",
    clearable: true,
}));
const __VLS_70 = __VLS_69({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.estado),
    options: (__VLS_ctx.ESTADO_EMPLEADO_OPTIONS),
    placeholder: "Todos los estados",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    'onUpdate:value': (__VLS_ctx.loadEmployees)
};
var __VLS_71;
var __VLS_67;
const __VLS_76 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "Departamento",
}));
const __VLS_78 = __VLS_77({
    label: "Departamento",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.departamento),
    placeholder: "Todos los departamentos",
    clearable: true,
    options: (__VLS_ctx.departmentOptions),
}));
const __VLS_82 = __VLS_81({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.departamento),
    placeholder: "Todos los departamentos",
    clearable: true,
    options: (__VLS_ctx.departmentOptions),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    'onUpdate:value': (__VLS_ctx.loadEmployees)
};
var __VLS_83;
var __VLS_79;
const __VLS_88 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onClick: (__VLS_ctx.clearFilters)
};
__VLS_95.slots.default;
var __VLS_95;
var __VLS_91;
var __VLS_51;
var __VLS_47;
const __VLS_100 = {}.NDataTable;
/** @type {[typeof __VLS_components.NDataTable, typeof __VLS_components.nDataTable, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.employees),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    rowKey: ((row) => row.id),
}));
const __VLS_102 = __VLS_101({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.employees),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    rowKey: ((row) => row.id),
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    'onUpdate:page': (__VLS_ctx.handlePageChange)
};
const __VLS_108 = {
    'onUpdate:pageSize': (__VLS_ctx.handlePageSizeChange)
};
var __VLS_103;
var __VLS_43;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['contracts-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AddIcon: AddIcon,
            RefreshIcon: RefreshIcon,
            ESTADO_EMPLEADO_OPTIONS: ESTADO_EMPLEADO_OPTIONS,
            loading: loading,
            employees: employees,
            filters: filters,
            pagination: pagination,
            departmentOptions: departmentOptions,
            columns: columns,
            loadEmployees: loadEmployees,
            debouncedSearch: debouncedSearch,
            refreshData: refreshData,
            clearFilters: clearFilters,
            handlePageChange: handlePageChange,
            handlePageSizeChange: handlePageSizeChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
