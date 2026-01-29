/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useEmployeeStore } from '@/store/employees';
import { ArrowBackIcon, EditIcon } from '@vicons/ionicons5';
import dayjs from 'dayjs';
const route = useRoute();
const router = useRouter();
const message = useMessage();
const employeeStore = useEmployeeStore();
const activeTab = ref('personal');
const loading = computed(() => employeeStore.loading);
const error = computed(() => employeeStore.error);
const employee = computed(() => employeeStore.currentEmployee);
const contractColumns = [
    {
        title: 'Tipo',
        key: 'tipoContrato',
        width: 120
    },
    {
        title: 'Régimen',
        key: 'regimenLaboral',
        width: 100
    },
    {
        title: 'Cargo',
        key: 'cargo'
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
        title: 'Salario',
        key: 'salarioBase',
        width: 100,
        render(row) {
            return `S/. ${row.salarioBase.toFixed(2)}`;
        }
    },
    {
        title: 'Estado',
        key: 'estado',
        width: 100,
        render(row) {
            const type = getContractStatusType(row.estado);
            return h('n-tag', { type, size: 'small' }, () => row.estado);
        }
    }
];
const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
};
const calculateAge = (birthDate) => {
    return dayjs().diff(dayjs(birthDate), 'year');
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
const getContractStatusType = (status) => {
    const types = {
        'VIGENTE': 'success',
        'SUSPENDIDO': 'warning',
        'FINALIZADO': 'error',
        'RENOVADO': 'info'
    };
    return types[status] || 'default';
};
const editEmployee = () => {
    router.push(`/empleados/${route.params.id}/edit`);
};
const loadEmployee = async () => {
    await employeeStore.fetchEmployee(route.params.id);
};
onMounted(() => {
    loadEmployee();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['employee-name']} */ ;
/** @type {__VLS_StyleScopedClasses['n-descriptions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "employee-detail-container" },
});
if (__VLS_ctx.loading) {
    const __VLS_0 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        loading: true,
        ...{ style: {} },
    }));
    const __VLS_2 = __VLS_1({
        loading: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else if (__VLS_ctx.employee) {
    const __VLS_4 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        align: "center",
        justify: "space-between",
    }));
    const __VLS_10 = __VLS_9({
        align: "center",
        justify: "space-between",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        align: "center",
    }));
    const __VLS_14 = __VLS_13({
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.NAvatar;
    /** @type {[typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        size: (80),
        src: (__VLS_ctx.employee.foto),
    }));
    const __VLS_18 = __VLS_17({
        size: (80),
        src: (__VLS_ctx.employee.foto),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    (__VLS_ctx.employee.nombres.charAt(0));
    var __VLS_19;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "employee-name" },
    });
    (__VLS_ctx.employee.nombreCompleto);
    const __VLS_20 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.employee.estado)),
    }));
    const __VLS_26 = __VLS_25({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.employee.estado)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    (__VLS_ctx.employee.estado);
    var __VLS_27;
    if (__VLS_ctx.employee.currentContract) {
        const __VLS_28 = {}.NTag;
        /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
        const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        (__VLS_ctx.employee.currentContract.cargo);
        var __VLS_31;
    }
    const __VLS_32 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        type: "info",
    }));
    const __VLS_34 = __VLS_33({
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    (__VLS_ctx.employee.numeroDocumento);
    var __VLS_35;
    var __VLS_23;
    var __VLS_15;
    const __VLS_36 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.loading))
                return;
            if (!(__VLS_ctx.employee))
                return;
            __VLS_ctx.$router.go(-1);
        }
    };
    __VLS_43.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_43.slots;
        const __VLS_48 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
        const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        const __VLS_52 = {}.ArrowBackIcon;
        /** @type {[typeof __VLS_components.ArrowBackIcon, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        var __VLS_51;
    }
    var __VLS_43;
    const __VLS_56 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_60;
    let __VLS_61;
    let __VLS_62;
    const __VLS_63 = {
        onClick: (__VLS_ctx.editEmployee)
    };
    __VLS_59.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_59.slots;
        const __VLS_64 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
        const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        const __VLS_68 = {}.EditIcon;
        /** @type {[typeof __VLS_components.EditIcon, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
        const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
        var __VLS_67;
    }
    var __VLS_59;
    var __VLS_39;
    var __VLS_11;
    var __VLS_7;
    const __VLS_72 = {}.NTabs;
    /** @type {[typeof __VLS_components.NTabs, typeof __VLS_components.nTabs, typeof __VLS_components.NTabs, typeof __VLS_components.nTabs, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        value: (__VLS_ctx.activeTab),
        type: "line",
        ...{ class: "detail-tabs" },
    }));
    const __VLS_74 = __VLS_73({
        value: (__VLS_ctx.activeTab),
        type: "line",
        ...{ class: "detail-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    const __VLS_76 = {}.NTabPane;
    /** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        name: "personal",
        tab: "Información Personal",
    }));
    const __VLS_78 = __VLS_77({
        name: "personal",
        tab: "Información Personal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    const __VLS_80 = {}.NGrid;
    /** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        cols: "1 s:2 m:3",
        responsive: "screen",
        xGap: (24),
        yGap: (16),
    }));
    const __VLS_82 = __VLS_81({
        cols: "1 s:2 m:3",
        responsive: "screen",
        xGap: (24),
        yGap: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    const __VLS_84 = {}.NGridItem;
    /** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
    const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        title: "Datos Personales",
        size: "small",
    }));
    const __VLS_90 = __VLS_89({
        title: "Datos Personales",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    const __VLS_92 = {}.NDescriptions;
    /** @type {[typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        column: (1),
        size: "small",
    }));
    const __VLS_94 = __VLS_93({
        column: (1),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    const __VLS_96 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        label: "Nombre Completo",
    }));
    const __VLS_98 = __VLS_97({
        label: "Nombre Completo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_99.slots.default;
    (__VLS_ctx.employee.nombreCompleto);
    var __VLS_99;
    const __VLS_100 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        label: "Tipo Documento",
    }));
    const __VLS_102 = __VLS_101({
        label: "Tipo Documento",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    (__VLS_ctx.employee.tipoDocumento);
    var __VLS_103;
    const __VLS_104 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        label: "Número Documento",
    }));
    const __VLS_106 = __VLS_105({
        label: "Número Documento",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    (__VLS_ctx.employee.numeroDocumento);
    var __VLS_107;
    const __VLS_108 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        label: "Fecha Nacimiento",
    }));
    const __VLS_110 = __VLS_109({
        label: "Fecha Nacimiento",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    (__VLS_ctx.formatDate(__VLS_ctx.employee.fechaNacimiento));
    var __VLS_111;
    const __VLS_112 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        label: "Edad",
    }));
    const __VLS_114 = __VLS_113({
        label: "Edad",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_115.slots.default;
    (__VLS_ctx.calculateAge(__VLS_ctx.employee.fechaNacimiento));
    var __VLS_115;
    const __VLS_116 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        label: "Lugar Nacimiento",
    }));
    const __VLS_118 = __VLS_117({
        label: "Lugar Nacimiento",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    (__VLS_ctx.employee.lugarNacimiento || 'No especificado');
    var __VLS_119;
    const __VLS_120 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        label: "Sexo",
    }));
    const __VLS_122 = __VLS_121({
        label: "Sexo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    (__VLS_ctx.employee.sexo === 'M' ? 'Masculino' : __VLS_ctx.employee.sexo === 'F' ? 'Femenino' : 'No especificado');
    var __VLS_123;
    const __VLS_124 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        label: "Estado Civil",
    }));
    const __VLS_126 = __VLS_125({
        label: "Estado Civil",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    (__VLS_ctx.employee.estadoCivil || 'No especificado');
    var __VLS_127;
    const __VLS_128 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        label: "Nacionalidad",
    }));
    const __VLS_130 = __VLS_129({
        label: "Nacionalidad",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    (__VLS_ctx.employee.nacionalidad || 'No especificado');
    var __VLS_131;
    const __VLS_132 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        label: "Número de Hijos",
    }));
    const __VLS_134 = __VLS_133({
        label: "Número de Hijos",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    (__VLS_ctx.employee.hijos || 0);
    var __VLS_135;
    var __VLS_95;
    var __VLS_91;
    var __VLS_87;
    const __VLS_136 = {}.NGridItem;
    /** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
    const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    const __VLS_140 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        title: "Educación y Profesión",
        size: "small",
    }));
    const __VLS_142 = __VLS_141({
        title: "Educación y Profesión",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    const __VLS_144 = {}.NDescriptions;
    /** @type {[typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        column: (1),
        size: "small",
    }));
    const __VLS_146 = __VLS_145({
        column: (1),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_147.slots.default;
    const __VLS_148 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        label: "Nivel Educativo",
    }));
    const __VLS_150 = __VLS_149({
        label: "Nivel Educativo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    __VLS_151.slots.default;
    (__VLS_ctx.employee.nivelEducativo || 'No especificado');
    var __VLS_151;
    const __VLS_152 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        label: "Profesión",
    }));
    const __VLS_154 = __VLS_153({
        label: "Profesión",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    __VLS_155.slots.default;
    (__VLS_ctx.employee.profesion || 'No especificado');
    var __VLS_155;
    const __VLS_156 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        label: "Licencia Conducir",
    }));
    const __VLS_158 = __VLS_157({
        label: "Licencia Conducir",
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    (__VLS_ctx.employee.licenciaConducir || 'No especificado');
    var __VLS_159;
    var __VLS_147;
    var __VLS_143;
    var __VLS_139;
    const __VLS_160 = {}.NGridItem;
    /** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
    const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    const __VLS_164 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        title: "Familiares",
        size: "small",
    }));
    const __VLS_166 = __VLS_165({
        title: "Familiares",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    const __VLS_168 = {}.NDescriptions;
    /** @type {[typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        column: (1),
        size: "small",
    }));
    const __VLS_170 = __VLS_169({
        column: (1),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    const __VLS_172 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        label: "Nombre Cónyuge",
    }));
    const __VLS_174 = __VLS_173({
        label: "Nombre Cónyuge",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    (__VLS_ctx.employee.nombreConyuge || 'No especificado');
    var __VLS_175;
    const __VLS_176 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        label: "DNI Cónyuge",
    }));
    const __VLS_178 = __VLS_177({
        label: "DNI Cónyuge",
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_179.slots.default;
    (__VLS_ctx.employee.dniConyuge || 'No especificado');
    var __VLS_179;
    const __VLS_180 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        label: "Nombre Padre",
    }));
    const __VLS_182 = __VLS_181({
        label: "Nombre Padre",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    (__VLS_ctx.employee.nombrePadre || 'No especificado');
    var __VLS_183;
    const __VLS_184 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        label: "Nombre Madre",
    }));
    const __VLS_186 = __VLS_185({
        label: "Nombre Madre",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    __VLS_187.slots.default;
    (__VLS_ctx.employee.nombreMadre || 'No especificado');
    var __VLS_187;
    var __VLS_171;
    var __VLS_167;
    var __VLS_163;
    var __VLS_83;
    var __VLS_79;
    const __VLS_188 = {}.NTabPane;
    /** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        name: "contact",
        tab: "Contacto y Ubicación",
    }));
    const __VLS_190 = __VLS_189({
        name: "contact",
        tab: "Contacto y Ubicación",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    const __VLS_192 = {}.NGrid;
    /** @type {[typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, typeof __VLS_components.NGrid, typeof __VLS_components.nGrid, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        cols: "1 s:2",
        responsive: "screen",
        xGap: (24),
        yGap: (16),
    }));
    const __VLS_194 = __VLS_193({
        cols: "1 s:2",
        responsive: "screen",
        xGap: (24),
        yGap: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    const __VLS_196 = {}.NGridItem;
    /** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({}));
    const __VLS_198 = __VLS_197({}, ...__VLS_functionalComponentArgsRest(__VLS_197));
    __VLS_199.slots.default;
    const __VLS_200 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        title: "Información de Contacto",
        size: "small",
    }));
    const __VLS_202 = __VLS_201({
        title: "Información de Contacto",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    __VLS_203.slots.default;
    const __VLS_204 = {}.NDescriptions;
    /** @type {[typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        column: (1),
        size: "small",
    }));
    const __VLS_206 = __VLS_205({
        column: (1),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    const __VLS_208 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        label: "Teléfono",
    }));
    const __VLS_210 = __VLS_209({
        label: "Teléfono",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    __VLS_211.slots.default;
    (__VLS_ctx.employee.telefono || 'No especificado');
    var __VLS_211;
    const __VLS_212 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        label: "Email Personal",
    }));
    const __VLS_214 = __VLS_213({
        label: "Email Personal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_215.slots.default;
    (__VLS_ctx.employee.email || 'No especificado');
    var __VLS_215;
    const __VLS_216 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        label: "Email Corporativo",
    }));
    const __VLS_218 = __VLS_217({
        label: "Email Corporativo",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    __VLS_219.slots.default;
    (__VLS_ctx.employee.emailCorporativo || 'No especificado');
    var __VLS_219;
    var __VLS_207;
    var __VLS_203;
    var __VLS_199;
    const __VLS_220 = {}.NGridItem;
    /** @type {[typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, typeof __VLS_components.NGridItem, typeof __VLS_components.nGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({}));
    const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
    __VLS_223.slots.default;
    const __VLS_224 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        title: "Dirección",
        size: "small",
    }));
    const __VLS_226 = __VLS_225({
        title: "Dirección",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    __VLS_227.slots.default;
    const __VLS_228 = {}.NDescriptions;
    /** @type {[typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        column: (1),
        size: "small",
    }));
    const __VLS_230 = __VLS_229({
        column: (1),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    __VLS_231.slots.default;
    const __VLS_232 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
        label: "Dirección",
    }));
    const __VLS_234 = __VLS_233({
        label: "Dirección",
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    __VLS_235.slots.default;
    (__VLS_ctx.employee.direccion || 'No especificado');
    var __VLS_235;
    const __VLS_236 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
        label: "Departamento",
    }));
    const __VLS_238 = __VLS_237({
        label: "Departamento",
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    __VLS_239.slots.default;
    (__VLS_ctx.employee.departamento || 'No especificado');
    var __VLS_239;
    const __VLS_240 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
        label: "Provincia",
    }));
    const __VLS_242 = __VLS_241({
        label: "Provincia",
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    __VLS_243.slots.default;
    (__VLS_ctx.employee.provincia || 'No especificado');
    var __VLS_243;
    const __VLS_244 = {}.NDescriptionsItem;
    /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
        label: "Distrito",
    }));
    const __VLS_246 = __VLS_245({
        label: "Distrito",
    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
    __VLS_247.slots.default;
    (__VLS_ctx.employee.distrito || 'No especificado');
    var __VLS_247;
    var __VLS_231;
    var __VLS_227;
    var __VLS_223;
    var __VLS_195;
    var __VLS_191;
    const __VLS_248 = {}.NTabPane;
    /** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        name: "banking",
        tab: "Datos Bancarios",
    }));
    const __VLS_250 = __VLS_249({
        name: "banking",
        tab: "Datos Bancarios",
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    __VLS_251.slots.default;
    const __VLS_252 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
        title: "Información Bancaria",
        size: "small",
    }));
    const __VLS_254 = __VLS_253({
        title: "Información Bancaria",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    __VLS_255.slots.default;
    if (__VLS_ctx.employee.banco || __VLS_ctx.employee.numeroCuenta) {
        const __VLS_256 = {}.NDescriptions;
        /** @type {[typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, ]} */ ;
        // @ts-ignore
        const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
            column: (1),
            size: "small",
        }));
        const __VLS_258 = __VLS_257({
            column: (1),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_257));
        __VLS_259.slots.default;
        const __VLS_260 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
            label: "Banco",
        }));
        const __VLS_262 = __VLS_261({
            label: "Banco",
        }, ...__VLS_functionalComponentArgsRest(__VLS_261));
        __VLS_263.slots.default;
        (__VLS_ctx.employee.banco || 'No especificado');
        var __VLS_263;
        const __VLS_264 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
            label: "Tipo de Cuenta",
        }));
        const __VLS_266 = __VLS_265({
            label: "Tipo de Cuenta",
        }, ...__VLS_functionalComponentArgsRest(__VLS_265));
        __VLS_267.slots.default;
        (__VLS_ctx.employee.tipoCuenta || 'No especificado');
        var __VLS_267;
        const __VLS_268 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
            label: "Número de Cuenta",
        }));
        const __VLS_270 = __VLS_269({
            label: "Número de Cuenta",
        }, ...__VLS_functionalComponentArgsRest(__VLS_269));
        __VLS_271.slots.default;
        (__VLS_ctx.employee.numeroCuenta || 'No especificado');
        var __VLS_271;
        const __VLS_272 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
            label: "Código CCI",
        }));
        const __VLS_274 = __VLS_273({
            label: "Código CCI",
        }, ...__VLS_functionalComponentArgsRest(__VLS_273));
        __VLS_275.slots.default;
        (__VLS_ctx.employee.numeroCCI || 'No especificado');
        var __VLS_275;
        var __VLS_259;
    }
    else {
        const __VLS_276 = {}.NEmpty;
        /** @type {[typeof __VLS_components.NEmpty, typeof __VLS_components.nEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
            description: "No hay información bancaria registrada",
        }));
        const __VLS_278 = __VLS_277({
            description: "No hay información bancaria registrada",
        }, ...__VLS_functionalComponentArgsRest(__VLS_277));
    }
    var __VLS_255;
    var __VLS_251;
    const __VLS_280 = {}.NTabPane;
    /** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
        name: "contracts",
        tab: "Contratos",
    }));
    const __VLS_282 = __VLS_281({
        name: "contracts",
        tab: "Contratos",
    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
    __VLS_283.slots.default;
    const __VLS_284 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
        vertical: true,
        size: "large",
    }));
    const __VLS_286 = __VLS_285({
        vertical: true,
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_285));
    __VLS_287.slots.default;
    if (__VLS_ctx.employee.currentContract) {
        const __VLS_288 = {}.NCard;
        /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
        // @ts-ignore
        const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
            title: "Contrato Actual",
            size: "small",
        }));
        const __VLS_290 = __VLS_289({
            title: "Contrato Actual",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_289));
        __VLS_291.slots.default;
        const __VLS_292 = {}.NDescriptions;
        /** @type {[typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, typeof __VLS_components.NDescriptions, typeof __VLS_components.nDescriptions, ]} */ ;
        // @ts-ignore
        const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
            column: (2),
            size: "small",
        }));
        const __VLS_294 = __VLS_293({
            column: (2),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_293));
        __VLS_295.slots.default;
        const __VLS_296 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
            label: "Tipo de Contrato",
        }));
        const __VLS_298 = __VLS_297({
            label: "Tipo de Contrato",
        }, ...__VLS_functionalComponentArgsRest(__VLS_297));
        __VLS_299.slots.default;
        (__VLS_ctx.employee.currentContract.tipoContrato);
        var __VLS_299;
        const __VLS_300 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
            label: "Régimen Laboral",
        }));
        const __VLS_302 = __VLS_301({
            label: "Régimen Laboral",
        }, ...__VLS_functionalComponentArgsRest(__VLS_301));
        __VLS_303.slots.default;
        (__VLS_ctx.employee.currentContract.regimenLaboral);
        var __VLS_303;
        const __VLS_304 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
            label: "Fecha Inicio",
        }));
        const __VLS_306 = __VLS_305({
            label: "Fecha Inicio",
        }, ...__VLS_functionalComponentArgsRest(__VLS_305));
        __VLS_307.slots.default;
        (__VLS_ctx.formatDate(__VLS_ctx.employee.currentContract.fechaInicio));
        var __VLS_307;
        const __VLS_308 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
            label: "Fecha Fin",
        }));
        const __VLS_310 = __VLS_309({
            label: "Fecha Fin",
        }, ...__VLS_functionalComponentArgsRest(__VLS_309));
        __VLS_311.slots.default;
        (__VLS_ctx.employee.currentContract.fechaFin ? __VLS_ctx.formatDate(__VLS_ctx.employee.currentContract.fechaFin) : 'Indefinido');
        var __VLS_311;
        const __VLS_312 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
            label: "Cargo",
        }));
        const __VLS_314 = __VLS_313({
            label: "Cargo",
        }, ...__VLS_functionalComponentArgsRest(__VLS_313));
        __VLS_315.slots.default;
        (__VLS_ctx.employee.currentContract.cargo);
        var __VLS_315;
        const __VLS_316 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
            label: "Puesto",
        }));
        const __VLS_318 = __VLS_317({
            label: "Puesto",
        }, ...__VLS_functionalComponentArgsRest(__VLS_317));
        __VLS_319.slots.default;
        (__VLS_ctx.employee.currentContract.puesto || 'No especificado');
        var __VLS_319;
        const __VLS_320 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
            label: "Salario Base",
        }));
        const __VLS_322 = __VLS_321({
            label: "Salario Base",
        }, ...__VLS_functionalComponentArgsRest(__VLS_321));
        __VLS_323.slots.default;
        (__VLS_ctx.employee.currentContract.salarioBase.toFixed(2));
        var __VLS_323;
        const __VLS_324 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
            label: "Moneda",
        }));
        const __VLS_326 = __VLS_325({
            label: "Moneda",
        }, ...__VLS_functionalComponentArgsRest(__VLS_325));
        __VLS_327.slots.default;
        (__VLS_ctx.employee.currentContract.tipoMoneda);
        var __VLS_327;
        const __VLS_328 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
            label: "Días Trabajo",
        }));
        const __VLS_330 = __VLS_329({
            label: "Días Trabajo",
        }, ...__VLS_functionalComponentArgsRest(__VLS_329));
        __VLS_331.slots.default;
        (__VLS_ctx.employee.currentContract.diasTrabajo);
        var __VLS_331;
        const __VLS_332 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
            label: "Horas Semanales",
        }));
        const __VLS_334 = __VLS_333({
            label: "Horas Semanales",
        }, ...__VLS_functionalComponentArgsRest(__VLS_333));
        __VLS_335.slots.default;
        (__VLS_ctx.employee.currentContract.horasSemanales);
        var __VLS_335;
        const __VLS_336 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
            label: "AFP/ONP",
        }));
        const __VLS_338 = __VLS_337({
            label: "AFP/ONP",
        }, ...__VLS_functionalComponentArgsRest(__VLS_337));
        __VLS_339.slots.default;
        (__VLS_ctx.employee.currentContract.nombreAFP || __VLS_ctx.employee.currentContract.afp);
        var __VLS_339;
        const __VLS_340 = {}.NDescriptionsItem;
        /** @type {[typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, typeof __VLS_components.NDescriptionsItem, typeof __VLS_components.nDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
            label: "CUSPP",
        }));
        const __VLS_342 = __VLS_341({
            label: "CUSPP",
        }, ...__VLS_functionalComponentArgsRest(__VLS_341));
        __VLS_343.slots.default;
        (__VLS_ctx.employee.currentContract.cuspp || 'No especificado');
        var __VLS_343;
        var __VLS_295;
        var __VLS_291;
    }
    if (__VLS_ctx.employee.contracts && __VLS_ctx.employee.contracts.length > 0) {
        const __VLS_344 = {}.NCard;
        /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
        // @ts-ignore
        const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
            title: "Historial de Contratos",
            size: "small",
        }));
        const __VLS_346 = __VLS_345({
            title: "Historial de Contratos",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_345));
        __VLS_347.slots.default;
        const __VLS_348 = {}.NDataTable;
        /** @type {[typeof __VLS_components.NDataTable, typeof __VLS_components.nDataTable, ]} */ ;
        // @ts-ignore
        const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
            columns: (__VLS_ctx.contractColumns),
            data: (__VLS_ctx.employee.contracts),
            pagination: ({ pageSize: 10 }),
            size: "small",
        }));
        const __VLS_350 = __VLS_349({
            columns: (__VLS_ctx.contractColumns),
            data: (__VLS_ctx.employee.contracts),
            pagination: ({ pageSize: 10 }),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_349));
        var __VLS_347;
    }
    else if (!__VLS_ctx.employee.currentContract) {
        const __VLS_352 = {}.NEmpty;
        /** @type {[typeof __VLS_components.NEmpty, typeof __VLS_components.nEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
            description: "No hay contratos registrados",
        }));
        const __VLS_354 = __VLS_353({
            description: "No hay contratos registrados",
        }, ...__VLS_functionalComponentArgsRest(__VLS_353));
    }
    var __VLS_287;
    var __VLS_283;
    const __VLS_356 = {}.NTabPane;
    /** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
        name: "payroll",
        tab: "Historial de Nómina",
    }));
    const __VLS_358 = __VLS_357({
        name: "payroll",
        tab: "Historial de Nómina",
    }, ...__VLS_functionalComponentArgsRest(__VLS_357));
    __VLS_359.slots.default;
    const __VLS_360 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
        title: "Historial de Planillas",
        size: "small",
    }));
    const __VLS_362 = __VLS_361({
        title: "Historial de Planillas",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_361));
    __VLS_363.slots.default;
    const __VLS_364 = {}.NEmpty;
    /** @type {[typeof __VLS_components.NEmpty, typeof __VLS_components.nEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
        description: "Historial de nómina no disponible temporalmente",
    }));
    const __VLS_366 = __VLS_365({
        description: "Historial de nómina no disponible temporalmente",
    }, ...__VLS_functionalComponentArgsRest(__VLS_365));
    var __VLS_363;
    var __VLS_359;
    var __VLS_75;
}
else if (__VLS_ctx.error) {
    const __VLS_368 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({}));
    const __VLS_370 = __VLS_369({}, ...__VLS_functionalComponentArgsRest(__VLS_369));
    __VLS_371.slots.default;
    const __VLS_372 = {}.NResult;
    /** @type {[typeof __VLS_components.NResult, typeof __VLS_components.nResult, typeof __VLS_components.NResult, typeof __VLS_components.nResult, ]} */ ;
    // @ts-ignore
    const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
        status: "error",
        title: "Error",
        description: (__VLS_ctx.error),
    }));
    const __VLS_374 = __VLS_373({
        status: "error",
        title: "Error",
        description: (__VLS_ctx.error),
    }, ...__VLS_functionalComponentArgsRest(__VLS_373));
    __VLS_375.slots.default;
    {
        const { footer: __VLS_thisSlot } = __VLS_375.slots;
        const __VLS_376 = {}.NSpace;
        /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
        // @ts-ignore
        const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({}));
        const __VLS_378 = __VLS_377({}, ...__VLS_functionalComponentArgsRest(__VLS_377));
        __VLS_379.slots.default;
        const __VLS_380 = {}.NButton;
        /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
        // @ts-ignore
        const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
            ...{ 'onClick': {} },
        }));
        const __VLS_382 = __VLS_381({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_381));
        let __VLS_384;
        let __VLS_385;
        let __VLS_386;
        const __VLS_387 = {
            onClick: (__VLS_ctx.loadEmployee)
        };
        __VLS_383.slots.default;
        var __VLS_383;
        const __VLS_388 = {}.NButton;
        /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
        // @ts-ignore
        const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({
            ...{ 'onClick': {} },
        }));
        const __VLS_390 = __VLS_389({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_389));
        let __VLS_392;
        let __VLS_393;
        let __VLS_394;
        const __VLS_395 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.employee))
                    return;
                if (!(__VLS_ctx.error))
                    return;
                __VLS_ctx.$router.push('/empleados');
            }
        };
        __VLS_391.slots.default;
        var __VLS_391;
        var __VLS_379;
    }
    var __VLS_375;
    var __VLS_371;
}
/** @type {__VLS_StyleScopedClasses['employee-detail-container']} */ ;
/** @type {__VLS_StyleScopedClasses['employee-name']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tabs']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowBackIcon: ArrowBackIcon,
            EditIcon: EditIcon,
            activeTab: activeTab,
            loading: loading,
            error: error,
            employee: employee,
            contractColumns: contractColumns,
            formatDate: formatDate,
            calculateAge: calculateAge,
            getStatusType: getStatusType,
            editEmployee: editEmployee,
            loadEmployee: loadEmployee,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
