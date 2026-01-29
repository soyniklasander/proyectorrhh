/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { NotificationsIcon, PersonIcon, DocumentIcon, TimeIcon, MoneyIcon, CalendarIcon, CheckIcon, WarningIcon, CloseIcon } from '@vicons/ionicons5';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('es');
const emit = defineEmits(['close']);
const message = useMessage();
// Reactive data
const loading = ref(false);
const hasMore = ref(false);
// Mock notifications (reemplazar con API real)
const notifications = ref([
    {
        id: '1',
        type: 'employee',
        title: 'Nuevo empleado registrado',
        description: 'Juan Pérez García ha sido agregado al sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
        actions: [
            { key: 'view', label: 'Ver', type: 'primary' }
        ]
    },
    {
        id: '2',
        type: 'contract',
        title: 'Contrato por vencer',
        description: 'El contrato de María López Martínez vence en 7 días',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        actions: [
            { key: 'view', label: 'Ver Contrato', type: 'primary' },
            { key: 'renew', label: 'Renovar', type: 'default' }
        ]
    },
    {
        id: '3',
        type: 'payroll',
        title: 'Planilla generada',
        description: 'La planilla de Enero 2024 ha sido generada exitosamente',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
        actions: [
            { key: 'view', label: 'Ver', type: 'primary' },
            { key: 'export', label: 'Exportar', type: 'default' }
        ]
    },
    {
        id: '4',
        type: 'overtime',
        title: 'Horas extras aprobadas',
        description: 'Se han aprobado 8 horas extras para Carlos Rodríguez',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        read: true,
        actions: [
            { key: 'view', label: 'Ver Detalles', type: 'primary' }
        ]
    },
    {
        id: '5',
        type: 'warning',
        title: 'Límite de préstamos alcanzado',
        description: 'Ana Martínez ha alcanzado el límite de préstamos permitidos',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        read: true,
        actions: [
            { key: 'view', label: 'Ver', type: 'primary' }
        ]
    }
]);
// Methods
const getNotificationIcon = (type) => {
    const icons = {
        employee: PersonIcon,
        contract: DocumentIcon,
        payroll: MoneyIcon,
        overtime: TimeIcon,
        leave: CalendarIcon,
        attendance: CheckIcon,
        warning: WarningIcon
    };
    return icons[type] || NotificationsIcon;
};
const getNotificationColor = (type) => {
    const colors = {
        employee: '#3b82f6',
        contract: '#8b5cf6',
        payroll: '#10b981',
        overtime: '#f59e0b',
        leave: '#06b6d4',
        attendance: '#22c55e',
        warning: '#ef4444'
    };
    return colors[type] || '#64748b';
};
const formatRelativeTime = (timestamp) => {
    return dayjs(timestamp).fromNow();
};
const markAllAsRead = () => {
    notifications.value.forEach(notification => {
        notification.read = true;
    });
    message.success('Todas las notificaciones marcadas como leídas');
};
const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
        notifications.value.splice(index, 1);
        message.success('Notificación eliminada');
    }
};
const handleAction = (action, notification) => {
    switch (action.key) {
        case 'view':
            // TODO: Implementar navegación según el tipo
            message.info(`Viendo ${notification.title.toLowerCase()}`);
            break;
        case 'renew':
            message.info('Abriendo formulario de renovación');
            break;
        case 'export':
            message.info('Exportando archivo...');
            break;
        default:
            break;
    }
    // Marcar como leída
    notification.read = true;
};
const loadMore = async () => {
    loading.value = true;
    try {
        // TODO: Implementar carga de más notificaciones
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock de más notificaciones
        const moreNotifications = [
            {
                id: '6',
                type: 'employee',
                title: 'Empleado actualizado',
                description: 'Los datos de Roberto Sánchez han sido actualizados',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
                read: true
            }
        ];
        notifications.value.push(...moreNotifications);
    }
    catch (error) {
        message.error('Error al cargar más notificaciones');
    }
    finally {
        loading.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['unread']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-header']} */ ;
/** @type {__VLS_StyleScopedClasses['n-list-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "notifications-panel" },
});
const __VLS_0 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    vertical: true,
    size: "large",
}));
const __VLS_2 = __VLS_1({
    vertical: true,
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    justify: "space-between",
    align: "center",
}));
const __VLS_6 = __VLS_5({
    justify: "space-between",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.NText;
/** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    strong: true,
}));
const __VLS_10 = __VLS_9({
    strong: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
const __VLS_12 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    text: true,
    size: "small",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    text: true,
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.markAllAsRead)
};
__VLS_15.slots.default;
var __VLS_15;
var __VLS_7;
if (__VLS_ctx.notifications.length > 0) {
    const __VLS_20 = {}.NList;
    /** @type {[typeof __VLS_components.NList, typeof __VLS_components.nList, typeof __VLS_components.NList, typeof __VLS_components.nList, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    for (const [notification] of __VLS_getVForSourceType((__VLS_ctx.notifications))) {
        const __VLS_24 = {}.NListItem;
        /** @type {[typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, typeof __VLS_components.NListItem, typeof __VLS_components.nListItem, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            key: (notification.id),
            ...{ class: ({ 'unread': !notification.read }) },
        }));
        const __VLS_26 = __VLS_25({
            key: (notification.id),
            ...{ class: ({ 'unread': !notification.read }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        const __VLS_28 = {}.NSpace;
        /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            align: "start",
            size: (12),
        }));
        const __VLS_30 = __VLS_29({
            align: "start",
            size: (12),
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        const __VLS_32 = {}.NAvatar;
        /** @type {[typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            size: (40),
            ...{ style: ({ backgroundColor: __VLS_ctx.getNotificationColor(notification.type) }) },
            round: true,
        }));
        const __VLS_34 = __VLS_33({
            size: (40),
            ...{ style: ({ backgroundColor: __VLS_ctx.getNotificationColor(notification.type) }) },
            round: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        const __VLS_36 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            color: (__VLS_ctx.white),
        }));
        const __VLS_38 = __VLS_37({
            color: (__VLS_ctx.white),
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        const __VLS_40 = ((__VLS_ctx.getNotificationIcon(notification.type)));
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
        const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
        var __VLS_39;
        var __VLS_35;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "notification-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "notification-header" },
        });
        const __VLS_44 = {}.NText;
        /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            strong: true,
        }));
        const __VLS_46 = __VLS_45({
            strong: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        (notification.title);
        var __VLS_47;
        const __VLS_48 = {}.NText;
        /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            depth: "3",
            ...{ style: {} },
        }));
        const __VLS_50 = __VLS_49({
            depth: "3",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        (__VLS_ctx.formatRelativeTime(notification.timestamp));
        var __VLS_51;
        const __VLS_52 = {}.NText;
        /** @type {[typeof __VLS_components.NText, typeof __VLS_components.nText, typeof __VLS_components.NText, typeof __VLS_components.nText, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            depth: "2",
            ...{ style: {} },
        }));
        const __VLS_54 = __VLS_53({
            depth: "2",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        (notification.description);
        var __VLS_55;
        if (notification.actions) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "notification-actions" },
            });
            const __VLS_56 = {}.NSpace;
            /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                size: "small",
            }));
            const __VLS_58 = __VLS_57({
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_57));
            __VLS_59.slots.default;
            for (const [action] of __VLS_getVForSourceType((notification.actions))) {
                const __VLS_60 = {}.NButton;
                /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                    ...{ 'onClick': {} },
                    key: (action.key),
                    type: (action.type || 'default'),
                    size: "small",
                }));
                const __VLS_62 = __VLS_61({
                    ...{ 'onClick': {} },
                    key: (action.key),
                    type: (action.type || 'default'),
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                let __VLS_64;
                let __VLS_65;
                let __VLS_66;
                const __VLS_67 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.notifications.length > 0))
                            return;
                        if (!(notification.actions))
                            return;
                        __VLS_ctx.handleAction(action, notification);
                    }
                };
                __VLS_63.slots.default;
                (action.label);
                var __VLS_63;
            }
            var __VLS_59;
        }
        const __VLS_68 = {}.NButton;
        /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ 'onClick': {} },
            text: true,
            size: "small",
        }));
        const __VLS_70 = __VLS_69({
            ...{ 'onClick': {} },
            text: true,
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_72;
        let __VLS_73;
        let __VLS_74;
        const __VLS_75 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.notifications.length > 0))
                    return;
                __VLS_ctx.removeNotification(notification.id);
            }
        };
        __VLS_71.slots.default;
        {
            const { icon: __VLS_thisSlot } = __VLS_71.slots;
            const __VLS_76 = {}.NIcon;
            /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
            // @ts-ignore
            const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
            const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
            __VLS_79.slots.default;
            const __VLS_80 = {}.CloseIcon;
            /** @type {[typeof __VLS_components.CloseIcon, ]} */ ;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
            const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
            var __VLS_79;
        }
        var __VLS_71;
        var __VLS_31;
        var __VLS_27;
    }
    var __VLS_23;
}
else {
    const __VLS_84 = {}.NEmpty;
    /** @type {[typeof __VLS_components.NEmpty, typeof __VLS_components.nEmpty, typeof __VLS_components.NEmpty, typeof __VLS_components.nEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        description: "No tienes notificaciones nuevas",
        size: "large",
    }));
    const __VLS_86 = __VLS_85({
        description: "No tienes notificaciones nuevas",
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    {
        const { icon: __VLS_thisSlot } = __VLS_87.slots;
        const __VLS_88 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            size: "48",
            color: "#94a3b8",
        }));
        const __VLS_90 = __VLS_89({
            size: "48",
            color: "#94a3b8",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_91.slots.default;
        const __VLS_92 = {}.NotificationsIcon;
        /** @type {[typeof __VLS_components.NotificationsIcon, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
        const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
        var __VLS_91;
    }
    var __VLS_87;
}
if (__VLS_ctx.hasMore) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "load-more" },
    });
    const __VLS_96 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        block: true,
        quaternary: true,
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        block: true,
        quaternary: true,
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_100;
    let __VLS_101;
    let __VLS_102;
    const __VLS_103 = {
        onClick: (__VLS_ctx.loadMore)
    };
    __VLS_99.slots.default;
    var __VLS_99;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['notifications-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-content']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-header']} */ ;
/** @type {__VLS_StyleScopedClasses['notification-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['load-more']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NotificationsIcon: NotificationsIcon,
            CloseIcon: CloseIcon,
            loading: loading,
            hasMore: hasMore,
            notifications: notifications,
            getNotificationIcon: getNotificationIcon,
            getNotificationColor: getNotificationColor,
            formatRelativeTime: formatRelativeTime,
            markAllAsRead: markAllAsRead,
            removeNotification: removeNotification,
            handleAction: handleAction,
            loadMore: loadMore,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
