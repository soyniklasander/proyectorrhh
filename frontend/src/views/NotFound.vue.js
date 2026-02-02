/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
// No se necesita lógica para esta página
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-not-found" },
});
const __VLS_0 = {}.NResult;
/** @type {[typeof __VLS_components.NResult, typeof __VLS_components.nResult, typeof __VLS_components.NResult, typeof __VLS_components.nResult, ]} */
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    status: "404",
    title: "Página No Encontrada",
    description: "La página que buscas no existe o ha sido movida.",
}));
const __VLS_2 = __VLS_1({
    status: "404",
    title: "Página No Encontrada",
    description: "La página que buscas no existe o ha sido movida.",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_4 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.go(-1);
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
    const __VLS_16 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/');
        }
    };
    __VLS_19.slots.default;
    var __VLS_19;
    var __VLS_7;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['page-not-found']} */
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
