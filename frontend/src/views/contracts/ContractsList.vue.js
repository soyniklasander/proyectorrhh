/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, useDialog } from 'naive-ui';
import { AddIcon, RefreshIcon, EditIcon, DeleteIcon, EyeIcon } from '@vicons/ionicons5';
import { TIPO_CONTRATO, REGIMEN_LABORAL, CONTRATO_ESTADOS } from '@/types/index';
import ContractForm from '@/components/forms/ContractForm.vue';
import { debounce } from 'lodash-es';
const router = useRouter();
const message = useMessage();
const dialog = useDialog();
// Reactive data
const loading = ref(false);
const contracts = ref([]);
const showNewContractModal = ref(false);
const showEditModal = ref(false);
const editingContract = ref(null);
const filters = reactive({
    empleado: '',
    tipoContrato: '',
    regimenLaboral: '',
    estado: ''
});
const pagination = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100]
});
// Columnas de la tabla
const columns = [
    {
        title: 'Empleado',
        key: 'employee',
        width: 200,
        render(row) {
            return h('div', { class: 'employee-info' }, [
                h('div', { class: 'employee-name' }, row.employee?.nombreCompleto || 'N/A'),
                h('div', { class: 'employee-dni' }, `DNI: ${row.employee?.numeroDocumento || 'N/A'}`)
            ]);
        }
    },
    {
        title: 'Tipo',
        key: 'tipoContrato',
        width: 120
    },
    {
        title: 'Régimen',
        key: 'regimenLaboral',
        width: 120
    },
    {
        title: 'Cargo',
        key: 'cargo',
        width: 150
    },
    {
        title: 'Salario',
        key: 'salarioBase',
        width: 100,
        render(row) {
            return h('span', `${row.tipoMoneda} ${row.salarioBase.toFixed(2)}`);
        }
    },
    {
        title: 'Fecha Inicio',
        key: 'fechaInicio',
        width: 120,
        render(row) {
            return formatDate(row.fechaInicio);
        }
    },
    {
        title: 'Fecha Fin',
        key: 'fechaFin',
        width: 120,
        render(row) {
            return row.fechaFin ? formatDate(row.fechaFin) : 'Indefinido';
        }
    },
    {
        title: 'Estado',
        key: 'estado',
        width: 100,
        render(row) {
            const type = getContractStatusType(row.estado);
            return h('n-tag', {
                type,
                size: 'small'
            }, () => row.estado);
        }
    },
    {
        title: 'Días Restantes',
        key: 'diasRestantes',
        width: 120,
        render(row) {
            if (!row.fechaFin || row.estado !== 'VIGENTE') {
                return h('span', { class: 'text-gray-500' }, 'N/A');
            }
            const dias = getDaysUntilExpiry(row.fechaFin);
            const type = dias <= 30 ? 'error' : dias <= 90 ? 'warning' : 'success';
            return h('n-tag', {
                type,
                size: 'small'
            }, () => `${dias} días`);
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
                    onClick: () => viewContract(row)
                }, () => h(EyeIcon)),
                h('n-button', {
                    circle: true,
                    size: 'small',
                    quaternary: true,
                    onClick: () => editContract(row)
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
    return new Date(date).toLocaleDateString('es-PE');
};
const getContractStatusType = (status) => {
    const types = {
        'VIGENTE': 'success',
        'SUSPENDIDO': 'warning',
        'FINALIZADO': 'error',
        'RENOVADO': 'info'
    };
    return types[status] || 'default';
};
const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
const loadContracts = async () => {
    loading.value = true;
    try {
        // TODO: Implementar llamada a API real
        // const response = await api.get('/contracts', { params: filters })
        // Mock data para demostración
        contracts.value = [
            {
                id: '1',
                empleadoId: '1',
                tipoContrato: 'INDETERMINADO',
                regimenLaboral: 'GENERAL',
                fechaInicio: '2024-01-15',
                fechaFin: null,
                cargo: 'Desarrollador Senior',
                salarioBase: 5000,
                tipoMoneda: 'PEN',
                estado: 'VIGENTE',
                diasTrabajo: 6,
                horasSemanales: 48,
                asignacionFamiliar: 93.00,
                tieneCTS: true,
                tieneVacaciones: true,
                tieneGratificaciones: true,
                tieneUtilidades: true,
                createdAt: '2024-01-15T00:00:00Z',
                updatedAt: '2024-01-15T00:00:00Z',
                employee: {
                    nombreCompleto: 'Juan Pérez García',
                    numeroDocumento: '12345678'
                }
            }
        ];
        // TODO: Implementar filtros en el cliente
        let filteredContracts = [...contracts.value];
        if (filters.empleado) {
            const searchTerm = filters.empleado.toLowerCase();
            filteredContracts = filteredContracts.filter(contract => contract.employee?.nombreCompleto?.toLowerCase().includes(searchTerm) ||
                contract.employee?.numeroDocumento?.includes(searchTerm));
        }
        if (filters.tipoContrato) {
            filteredContracts = filteredContracts.filter(c => c.tipoContrato === filters.tipoContrato);
        }
        if (filters.regimenLaboral) {
            filteredContracts = filteredContracts.filter(c => c.regimenLaboral === filters.regimenLaboral);
        }
        if (filters.estado) {
            filteredContracts = filteredContracts.filter(c => c.estado === filters.estado);
        }
        pagination.itemCount = filteredContracts.length;
    }
    catch (error) {
        message.error('Error al cargar contratos');
        console.error('Load contracts error:', error);
    }
    finally {
        loading.value = false;
    }
};
const debouncedSearch = debounce(loadContracts, 300);
const refreshData = () => {
    loadContracts();
};
const clearFilters = () => {
    Object.assign(filters, {
        empleado: '',
        tipoContrato: '',
        regimenLaboral: '',
        estado: ''
    });
    pagination.page = 1;
    loadContracts();
};
const viewContract = (contract) => {
    router.push(`/contratos/${contract.id}`);
};
const editContract = (contract) => {
    editingContract.value = contract;
    showEditModal.value = true;
};
const confirmDelete = (contract) => {
    dialog.warning({
        title: 'Eliminar Contrato',
        content: `¿Estás seguro de que deseas eliminar el contrato de ${contract.employee?.nombreCompleto}?`,
        positiveText: 'Eliminar',
        negativeText: 'Cancelar',
        onPositiveClick: async () => {
            try {
                // TODO: Implementar llamada a API
                // await api.delete(`/contracts/${contract.id}`)
                message.success('Contrato eliminado exitosamente');
                loadContracts();
            }
            catch (error) {
                message.error('Error al eliminar contrato');
            }
        }
    });
};
const handleCreateContract = async (contractData) => {
    try {
        // TODO: Implementar llamada a API
        // await api.post('/contracts', contractData)
        message.success('Contrato creado exitosamente');
        showNewContractModal.value = false;
        loadContracts();
    }
    catch (error) {
        message.error('Error al crear contrato');
    }
};
const handleUpdateContract = async (contractData) => {
    if (!editingContract.value)
        return;
    try {
        // TODO: Implementar llamada a API
        // await api.patch(`/contracts/${editingContract.value.id}`, contractData)
        message.success('Contrato actualizado exitosamente');
        showEditModal.value = false;
        editingContract.value = null;
        loadContracts();
    }
    catch (error) {
        message.error('Error al actualizar contrato');
    }
};
const handlePageChange = (page) => {
    pagination.page = page;
    loadContracts();
};
const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadContracts();
};
// Load initial data
loadContracts();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "contracts-container" },
});
const __VLS_0 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "Gestión de Contratos",
}));
const __VLS_2 = __VLS_1({
    title: "Gestión de Contratos",
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
            __VLS_ctx.showNewContractModal = true;
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
    label: "Empleado",
}));
const __VLS_54 = __VLS_53({
    label: "Empleado",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onInput': {} },
    value: (__VLS_ctx.filters.empleado),
    placeholder: "Buscar por nombre o DNI",
    clearable: true,
}));
const __VLS_58 = __VLS_57({
    ...{ 'onInput': {} },
    value: (__VLS_ctx.filters.empleado),
    placeholder: "Buscar por nombre o DNI",
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
    label: "Tipo Contrato",
}));
const __VLS_66 = __VLS_65({
    label: "Tipo Contrato",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.tipoContrato),
    options: (__VLS_ctx.TIPO_CONTRATO_OPTIONS),
    placeholder: "Todos los tipos",
    clearable: true,
}));
const __VLS_70 = __VLS_69({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.tipoContrato),
    options: (__VLS_ctx.TIPO_CONTRATO_OPTIONS),
    placeholder: "Todos los tipos",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    'onUpdate:value': (__VLS_ctx.loadContracts)
};
var __VLS_71;
var __VLS_67;
const __VLS_76 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "Régimen",
}));
const __VLS_78 = __VLS_77({
    label: "Régimen",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.regimenLaboral),
    options: (__VLS_ctx.REGIMEN_LABORAL_OPTIONS),
    placeholder: "Todos los regímenes",
    clearable: true,
}));
const __VLS_82 = __VLS_81({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.regimenLaboral),
    options: (__VLS_ctx.REGIMEN_LABORAL_OPTIONS),
    placeholder: "Todos los regímenes",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    'onUpdate:value': (__VLS_ctx.loadContracts)
};
var __VLS_83;
var __VLS_79;
const __VLS_88 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "Estado",
}));
const __VLS_90 = __VLS_89({
    label: "Estado",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.estado),
    options: (__VLS_ctx.CONTRATO_ESTADOS),
    placeholder: "Todos los estados",
    clearable: true,
}));
const __VLS_94 = __VLS_93({
    ...{ 'onUpdate:value': {} },
    value: (__VLS_ctx.filters.estado),
    options: (__VLS_ctx.CONTRATO_ESTADOS),
    placeholder: "Todos los estados",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    'onUpdate:value': (__VLS_ctx.loadContracts)
};
var __VLS_95;
var __VLS_91;
const __VLS_100 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    ...{ 'onClick': {} },
}));
const __VLS_106 = __VLS_105({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_108;
let __VLS_109;
let __VLS_110;
const __VLS_111 = {
    onClick: (__VLS_ctx.clearFilters)
};
__VLS_107.slots.default;
var __VLS_107;
var __VLS_103;
var __VLS_51;
var __VLS_47;
const __VLS_112 = {}.NDataTable;
/** @type {[typeof __VLS_components.NDataTable, typeof __VLS_components.nDataTable, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.contracts),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    rowKey: ((row) => row.id),
}));
const __VLS_114 = __VLS_113({
    ...{ 'onUpdate:page': {} },
    ...{ 'onUpdate:pageSize': {} },
    columns: (__VLS_ctx.columns),
    data: (__VLS_ctx.contracts),
    loading: (__VLS_ctx.loading),
    pagination: (__VLS_ctx.pagination),
    rowKey: ((row) => row.id),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    'onUpdate:page': (__VLS_ctx.handlePageChange)
};
const __VLS_120 = {
    'onUpdate:pageSize': (__VLS_ctx.handlePageSizeChange)
};
var __VLS_115;
var __VLS_43;
var __VLS_3;
const __VLS_121 = {}.NModal;
/** @type {[typeof __VLS_components.NModal, typeof __VLS_components.nModal, typeof __VLS_components.NModal, typeof __VLS_components.nModal, ]} */ ;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
    show: (__VLS_ctx.showNewContractModal),
    preset: "dialog",
    title: "Nuevo Contrato",
    ...{ style: {} },
}));
const __VLS_123 = __VLS_122({
    show: (__VLS_ctx.showNewContractModal),
    preset: "dialog",
    title: "Nuevo Contrato",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_124.slots.default;
if (__VLS_ctx.showNewContractModal) {
    /** @type {[typeof ContractForm, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(ContractForm, new ContractForm({
        ...{ 'onSubmit': {} },
        ...{ 'onCancel': {} },
    }));
    const __VLS_126 = __VLS_125({
        ...{ 'onSubmit': {} },
        ...{ 'onCancel': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    let __VLS_128;
    let __VLS_129;
    let __VLS_130;
    const __VLS_131 = {
        onSubmit: (__VLS_ctx.handleCreateContract)
    };
    const __VLS_132 = {
        onCancel: (...[$event]) => {
            if (!(__VLS_ctx.showNewContractModal))
                return;
            __VLS_ctx.showNewContractModal = false;
        }
    };
    var __VLS_127;
}
var __VLS_124;
const __VLS_133 = {}.NModal;
/** @type {[typeof __VLS_components.NModal, typeof __VLS_components.nModal, typeof __VLS_components.NModal, typeof __VLS_components.nModal, ]} */ ;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
    show: (__VLS_ctx.showEditModal),
    preset: "dialog",
    title: "Editar Contrato",
    ...{ style: {} },
}));
const __VLS_135 = __VLS_134({
    show: (__VLS_ctx.showEditModal),
    preset: "dialog",
    title: "Editar Contrato",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
__VLS_136.slots.default;
if (__VLS_ctx.showEditModal && __VLS_ctx.editingContract) {
    /** @type {[typeof ContractForm, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(ContractForm, new ContractForm({
        ...{ 'onSubmit': {} },
        ...{ 'onCancel': {} },
        contract: (__VLS_ctx.editingContract),
        isEditing: (true),
    }));
    const __VLS_138 = __VLS_137({
        ...{ 'onSubmit': {} },
        ...{ 'onCancel': {} },
        contract: (__VLS_ctx.editingContract),
        isEditing: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    let __VLS_140;
    let __VLS_141;
    let __VLS_142;
    const __VLS_143 = {
        onSubmit: (__VLS_ctx.handleUpdateContract)
    };
    const __VLS_144 = {
        onCancel: (...[$event]) => {
            if (!(__VLS_ctx.showEditModal && __VLS_ctx.editingContract))
                return;
            __VLS_ctx.showEditModal = false;
        }
    };
    var __VLS_139;
}
var __VLS_136;
/** @type {__VLS_StyleScopedClasses['contracts-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AddIcon: AddIcon,
            RefreshIcon: RefreshIcon,
            CONTRATO_ESTADOS: CONTRATO_ESTADOS,
            ContractForm: ContractForm,
            loading: loading,
            contracts: contracts,
            showNewContractModal: showNewContractModal,
            showEditModal: showEditModal,
            editingContract: editingContract,
            filters: filters,
            pagination: pagination,
            columns: columns,
            loadContracts: loadContracts,
            debouncedSearch: debouncedSearch,
            refreshData: refreshData,
            clearFilters: clearFilters,
            handleCreateContract: handleCreateContract,
            handleUpdateContract: handleUpdateContract,
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
