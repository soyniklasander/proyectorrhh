/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useAuthStore } from '@/store/auth';
import { BusinessIcon, HomeIcon, PeopleIcon, DocumentIcon, TimeIcon, MoneyIcon, CalendarIcon, CheckIcon, DownloadIcon, NotificationsIcon, MoonIcon, SunnyIcon, ChevronDownIcon, LogOutIcon, SettingsIcon, UserIcon } from '@vicons/ionicons5';
import NotificationsPanel from '@/components/panels/NotificationsPanel.vue';
const router = useRouter();
const route = useRoute();
const message = useMessage();
const authStore = useAuthStore();
// Reactive data
const showUserMenu = ref(false);
const showNotificationsDrawer = ref(false);
const notificationCount = ref(3); // Mock count
const user = computed(() => authStore.user);
const isDarkMode = computed(() => authStore.isDarkMode);
// Current route for menu
const currentRoute = computed(() => {
    const path = route.path;
    if (path.startsWith('/empleados'))
        return 'employees';
    if (path.startsWith('/contratos'))
        return 'contracts';
    if (path.startsWith('/horas-extras'))
        return 'overtime';
    if (path.startsWith('/prestamos'))
        return 'loans';
    if (path.startsWith('/planilla'))
        return 'payroll';
    if (path.startsWith('/vacaciones'))
        return 'leaves';
    if (path.startsWith('/asistencia'))
        return 'attendance';
    return 'dashboard';
});
// Menu options
const menuOptions = [
    {
        label: 'Panel',
        key: 'dashboard',
        icon: () => h(HomeIcon)
    },
    {
        label: 'Empleados',
        key: 'employees',
        icon: () => h(PeopleIcon),
        children: [
            {
                label: 'Lista de Empleados',
                key: 'employees-list',
                icon: () => h(PeopleIcon)
            },
            {
                label: 'Nuevo Empleado',
                key: 'employees-new',
                icon: () => h(PeopleIcon)
            }
        ]
    },
    {
        label: 'Contratos',
        key: 'contracts',
        icon: () => h(DocumentIcon)
    },
    {
        label: 'Horas Extras',
        key: 'overtime',
        icon: () => h(TimeIcon)
    },
    {
        label: 'Préstamos',
        key: 'loans',
        icon: () => h(MoneyIcon)
    },
    {
        label: 'Planilla',
        key: 'payroll',
        icon: () => h(MoneyIcon)
    },
    {
        label: 'Vacaciones',
        key: 'leaves',
        icon: () => h(CalendarIcon)
    },
    {
        label: 'Asistencia',
        key: 'attendance',
        icon: () => h(CheckIcon)
    }
];
// User menu options
const userMenuOptions = [
    {
        label: 'Mi Perfil',
        key: 'profile',
        icon: () => h(UserIcon)
    },
    {
        label: 'Configuración',
        key: 'settings',
        icon: () => h(SettingsIcon)
    },
    {
        type: 'divider'
    },
    {
        label: 'Cerrar Sesión',
        key: 'logout',
        icon: () => h(LogOutIcon)
    }
];
// Methods
const hasPermission = (permission) => {
    // TODO: Implementar verificación de permisos real
    return true;
};
const toggleDarkMode = () => {
    authStore.toggleDarkMode();
};
const handleMenuSelect = (key) => {
    switch (key) {
        case 'dashboard':
            router.push('/dashboard');
            break;
        case 'employees-list':
            router.push('/empleados');
            break;
        case 'employees-new':
            router.push('/empleados/nuevo');
            break;
        case 'contracts':
            router.push('/contratos');
            break;
        case 'overtime':
            router.push('/horas-extras');
            break;
        case 'loans':
            router.push('/prestamos');
            break;
        case 'payroll':
            router.push('/planilla');
            break;
        case 'leaves':
            router.push('/vacaciones');
            break;
        case 'attendance':
            router.push('/asistencia');
            break;
        default:
            break;
    }
};
const handleUserMenuSelect = (key) => {
    showUserMenu.value = false;
    switch (key) {
        case 'profile':
            router.push('/profile');
            break;
        case 'settings':
            router.push('/settings');
            break;
        case 'logout':
            handleLogout();
            break;
        default:
            break;
    }
};
const handleLogout = () => {
    authStore.logout();
    router.push('/login');
    message.success('Sesión cerrada correctamente');
};
const exportPayroll = async () => {
    try {
        // TODO: Implementar exportación real
        message.success('Exportando nómina...');
    }
    catch (error) {
        message.error('Error al exportar nómina');
    }
};
const showNotifications = () => {
    showNotificationsDrawer.value = true;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-center']} */
/** @type {__VLS_StyleScopedClasses['header-left']} */
/** @type {__VLS_StyleScopedClasses['header-right']} */
/** @type {__VLS_StyleScopedClasses['user-name']} */
/** @type {__VLS_StyleScopedClasses['logo-text']} */
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
const __VLS_0 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    align: "center",
}));
const __VLS_2 = __VLS_1({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    text: true,
    ...{ class: "logo-button" },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    text: true,
    ...{ class: "logo-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push('/');
    }
};
__VLS_7.slots.default;
const __VLS_12 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    size: "24",
    color: "#3b82f6",
}));
const __VLS_14 = __VLS_13({
    size: "24",
    color: "#3b82f6",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.BusinessIcon;
/** @type {[typeof __VLS_components.BusinessIcon, ]} */
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "logo-text" },
});
var __VLS_7;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-center" },
});
const __VLS_20 = {}.NMenu;
/** @type {[typeof __VLS_components.NMenu, typeof __VLS_components.nMenu, ]} */
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onUpdate:value': {} },
    mode: "horizontal",
    options: (__VLS_ctx.menuOptions),
    value: (__VLS_ctx.currentRoute),
    responsive: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onUpdate:value': {} },
    mode: "horizontal",
    options: (__VLS_ctx.menuOptions),
    value: (__VLS_ctx.currentRoute),
    responsive: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    'onUpdate:value': (__VLS_ctx.handleMenuSelect)
};
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
const __VLS_28 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    align: "center",
}));
const __VLS_30 = __VLS_29({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
if (__VLS_ctx.hasPermission('payroll.export')) {
    const __VLS_32 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        quaternary: true,
        circle: true,
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        quaternary: true,
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.exportPayroll)
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
        const __VLS_44 = {}.DownloadIcon;
        /** @type {[typeof __VLS_components.DownloadIcon, ]} */
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        var __VLS_43;
    }
    var __VLS_35;
}
const __VLS_48 = {}.NBadge;
/** @type {[typeof __VLS_components.NBadge, typeof __VLS_components.nBadge, typeof __VLS_components.NBadge, typeof __VLS_components.nBadge, ]} */
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    value: (__VLS_ctx.notificationCount),
    max: (99),
    show: (__VLS_ctx.notificationCount > 0),
}));
const __VLS_50 = __VLS_49({
    value: (__VLS_ctx.notificationCount),
    max: (99),
    show: (__VLS_ctx.notificationCount > 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    quaternary: true,
    circle: true,
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    quaternary: true,
    circle: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (__VLS_ctx.showNotifications)
};
__VLS_55.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_55.slots;
    const __VLS_60 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    const __VLS_64 = {}.NotificationsIcon;
    /** @type {[typeof __VLS_components.NotificationsIcon, ]} */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
    const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
    var __VLS_63;
}
var __VLS_55;
var __VLS_51;
const __VLS_68 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    quaternary: true,
    circle: true,
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    quaternary: true,
    circle: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (__VLS_ctx.toggleDarkMode)
};
__VLS_71.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_71.slots;
    const __VLS_76 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    const __VLS_80 = ((__VLS_ctx.isDarkMode ? __VLS_ctx.SunnyIcon : __VLS_ctx.MoonIcon));
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
    const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
    var __VLS_79;
}
var __VLS_71;
const __VLS_84 = {}.NDropdown;
/** @type {[typeof __VLS_components.NDropdown, typeof __VLS_components.nDropdown, typeof __VLS_components.NDropdown, typeof __VLS_components.nDropdown, ]} */
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ 'onSelect': {} },
    options: (__VLS_ctx.userMenuOptions),
    show: (__VLS_ctx.showUserMenu),
    onClickoutside: (() => __VLS_ctx.showUserMenu = false),
    placement: "bottom-end",
    trigger: "click",
}));
const __VLS_86 = __VLS_85({
    ...{ 'onSelect': {} },
    options: (__VLS_ctx.userMenuOptions),
    show: (__VLS_ctx.showUserMenu),
    onClickoutside: (() => __VLS_ctx.showUserMenu = false),
    placement: "bottom-end",
    trigger: "click",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_88;
let __VLS_89;
let __VLS_90;
const __VLS_91 = {
    onSelect: (__VLS_ctx.handleUserMenuSelect)
};
__VLS_87.slots.default;
const __VLS_92 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    quaternary: true,
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    quaternary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showUserMenu = !__VLS_ctx.showUserMenu;
    }
};
__VLS_95.slots.default;
const __VLS_100 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    align: "center",
}));
const __VLS_102 = __VLS_101({
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.NAvatar;
/** @type {[typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, ]} */
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    size: (32),
    src: (__VLS_ctx.user?.avatar),
    round: true,
}));
const __VLS_106 = __VLS_105({
    size: (32),
    src: (__VLS_ctx.user?.avatar),
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
(__VLS_ctx.user?.name?.charAt(0).toUpperCase());
var __VLS_107;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "user-name" },
});
(__VLS_ctx.user?.name);
const __VLS_108 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ChevronDownIcon;
/** @type {[typeof __VLS_components.ChevronDownIcon, ]} */
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
var __VLS_111;
var __VLS_103;
var __VLS_95;
var __VLS_87;
var __VLS_31;
const __VLS_116 = {}.NDrawer;
/** @type {[typeof __VLS_components.NDrawer, typeof __VLS_components.nDrawer, typeof __VLS_components.NDrawer, typeof __VLS_components.nDrawer, ]} */
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    show: (__VLS_ctx.showNotificationsDrawer),
    width: "400",
    placement: "right",
}));
const __VLS_118 = __VLS_117({
    show: (__VLS_ctx.showNotificationsDrawer),
    width: "400",
    placement: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.NDrawerContent;
/** @type {[typeof __VLS_components.NDrawerContent, typeof __VLS_components.nDrawerContent, typeof __VLS_components.NDrawerContent, typeof __VLS_components.nDrawerContent, ]} */
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    title: "Notificaciones",
    closable: true,
}));
const __VLS_122 = __VLS_121({
    title: "Notificaciones",
    closable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
/** @type {[typeof NotificationsPanel, ]} */
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(NotificationsPanel, new NotificationsPanel({
    ...{ 'onClose': {} },
}));
const __VLS_125 = __VLS_124({
    ...{ 'onClose': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
let __VLS_127;
let __VLS_128;
let __VLS_129;
const __VLS_130 = {
    onClose: (...[$event]) => {
        __VLS_ctx.showNotificationsDrawer = false;
    }
};
var __VLS_126;
var __VLS_123;
var __VLS_119;
/** @type {__VLS_StyleScopedClasses['app-header']} */
/** @type {__VLS_StyleScopedClasses['header-left']} */
/** @type {__VLS_StyleScopedClasses['logo-button']} */
/** @type {__VLS_StyleScopedClasses['logo-text']} */
/** @type {__VLS_StyleScopedClasses['header-center']} */
/** @type {__VLS_StyleScopedClasses['header-right']} */
/** @type {__VLS_StyleScopedClasses['user-name']} */
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BusinessIcon: BusinessIcon,
            DownloadIcon: DownloadIcon,
            NotificationsIcon: NotificationsIcon,
            MoonIcon: MoonIcon,
            SunnyIcon: SunnyIcon,
            ChevronDownIcon: ChevronDownIcon,
            NotificationsPanel: NotificationsPanel,
            showUserMenu: showUserMenu,
            showNotificationsDrawer: showNotificationsDrawer,
            notificationCount: notificationCount,
            user: user,
            isDarkMode: isDarkMode,
            currentRoute: currentRoute,
            menuOptions: menuOptions,
            userMenuOptions: userMenuOptions,
            hasPermission: hasPermission,
            toggleDarkMode: toggleDarkMode,
            handleMenuSelect: handleMenuSelect,
            handleUserMenuSelect: handleUserMenuSelect,
            exportPayroll: exportPayroll,
            showNotifications: showNotifications,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
