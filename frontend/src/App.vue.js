/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted } from 'vue';
import { NConfigProvider, darkTheme, NLayout, NLayoutHeader, NLayoutContent, NLoadingBarProvider, NDialogProvider, NNotificationProvider, NMessageProvider } from 'naive-ui';
import { useAuthStore } from '@/store/auth';
import AppHeader from '@/components/shared/AppHeader.vue';
const authStore = useAuthStore();
const theme = computed(() => {
    return authStore.isDarkMode ? darkTheme : null;
});
const isAuthenticated = computed(() => authStore.isAuthenticated);
onMounted(() => {
    authStore.checkAuth();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "app",
});
const __VLS_0 = {}.NConfigProvider;
/** @type {[typeof __VLS_components.NConfigProvider, typeof __VLS_components.nConfigProvider, typeof __VLS_components.NConfigProvider, typeof __VLS_components.nConfigProvider, ]} */
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    theme: (__VLS_ctx.theme),
}));
const __VLS_2 = __VLS_1({
    theme: (__VLS_ctx.theme),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.NLoadingBarProvider;
/** @type {[typeof __VLS_components.NLoadingBarProvider, typeof __VLS_components.nLoadingBarProvider, typeof __VLS_components.NLoadingBarProvider, typeof __VLS_components.nLoadingBarProvider, ]} */
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.NDialogProvider;
/** @type {[typeof __VLS_components.NDialogProvider, typeof __VLS_components.nDialogProvider, typeof __VLS_components.NDialogProvider, typeof __VLS_components.nDialogProvider, ]} */
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.NNotificationProvider;
/** @type {[typeof __VLS_components.NNotificationProvider, typeof __VLS_components.nNotificationProvider, typeof __VLS_components.NNotificationProvider, typeof __VLS_components.nNotificationProvider, ]} */
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.NMessageProvider;
/** @type {[typeof __VLS_components.NMessageProvider, typeof __VLS_components.nMessageProvider, typeof __VLS_components.NMessageProvider, typeof __VLS_components.nMessageProvider, ]} */
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.NLayout;
/** @type {[typeof __VLS_components.NLayout, typeof __VLS_components.nLayout, typeof __VLS_components.NLayout, typeof __VLS_components.nLayout, ]} */
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
if (__VLS_ctx.isAuthenticated) {
    const __VLS_24 = {}.NLayoutHeader;
    /** @type {[typeof __VLS_components.NLayoutHeader, typeof __VLS_components.nLayoutHeader, typeof __VLS_components.NLayoutHeader, typeof __VLS_components.nLayoutHeader, ]} */
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        bordered: true,
    }));
    const __VLS_26 = __VLS_25({
        bordered: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    /** @type {[typeof AppHeader, ]} */
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(AppHeader, new AppHeader({}));
    const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
    var __VLS_27;
}
const __VLS_31 = {}.NLayoutContent;
/** @type {[typeof __VLS_components.NLayoutContent, typeof __VLS_components.nLayoutContent, typeof __VLS_components.NLayoutContent, typeof __VLS_components.nLayoutContent, ]} */
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({}));
const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
const __VLS_35 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({}));
const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
var __VLS_34;
var __VLS_23;
var __VLS_19;
var __VLS_15;
var __VLS_11;
var __VLS_7;
var __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NConfigProvider: NConfigProvider,
            NLayout: NLayout,
            NLayoutHeader: NLayoutHeader,
            NLayoutContent: NLayoutContent,
            NLoadingBarProvider: NLoadingBarProvider,
            NDialogProvider: NDialogProvider,
            NNotificationProvider: NNotificationProvider,
            NMessageProvider: NMessageProvider,
            AppHeader: AppHeader,
            theme: theme,
            isAuthenticated: isAuthenticated,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
