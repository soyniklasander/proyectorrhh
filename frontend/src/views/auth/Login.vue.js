/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useAuthStore } from '@/store/auth';
const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);
const error = ref('');
const formData = reactive({
    email: '',
    password: '',
    rememberMe: false
});
const rules = {
    email: [
        {
            required: true,
            message: 'Por favor ingresa tu correo electrónico',
            trigger: ['input', 'blur']
        },
        {
            type: 'email',
            message: 'Por favor ingresa un correo válido',
            trigger: ['input', 'blur']
        }
    ],
    password: [
        {
            required: true,
            message: 'Por favor ingresa tu contraseña',
            trigger: ['input', 'blur']
        },
        {
            min: 6,
            message: 'La contraseña debe tener al menos 6 caracteres',
            trigger: ['input', 'blur']
        }
    ]
};
const handleLogin = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        loading.value = true;
        error.value = '';
        const success = await authStore.login({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe
        });
        if (success) {
            message.success('¡Bienvenido de nuevo!');
            router.push('/dashboard');
        }
        else {
            error.value = 'Credenciales inválidas. Por favor intenta nuevamente.';
        }
    }
    catch (errors) {
        console.error('Validation errors:', errors);
    }
    finally {
        loading.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['auth-card']} */
/** @type {__VLS_StyleScopedClasses['dark']} */
/** @type {__VLS_StyleScopedClasses['auth-title']} */
/** @type {__VLS_StyleScopedClasses['dark']} */
/** @type {__VLS_StyleScopedClasses['auth-subtitle']} */
/** @type {__VLS_StyleScopedClasses['auth-container']} */
/** @type {__VLS_StyleScopedClasses['auth-card']} */
/** @type {__VLS_StyleScopedClasses['auth-title']} */
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-layout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "auth-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "auth-subtitle" },
});
const __VLS_0 = {}.NForm;
/** @type {[typeof __VLS_components.NForm, typeof __VLS_components.nForm, typeof __VLS_components.NForm, typeof __VLS_components.nForm, ]} */
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    model: (__VLS_ctx.formData),
    rules: (__VLS_ctx.rules),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onSubmit: (__VLS_ctx.handleLogin)
};
/** @type {typeof __VLS_ctx.formRef} */
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_10 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    path: "email",
    label: "Correo Electrónico",
}));
const __VLS_12 = __VLS_11({
    path: "email",
    label: "Correo Electrónico",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
const __VLS_14 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    value: (__VLS_ctx.formData.email),
    placeholder: "correo@empresa.com",
    type: "email",
    size: "large",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_16 = __VLS_15({
    value: (__VLS_ctx.formData.email),
    placeholder: "correo@empresa.com",
    type: "email",
    size: "large",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
var __VLS_13;
const __VLS_18 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    path: "password",
    label: "Contraseña",
}));
const __VLS_20 = __VLS_19({
    path: "password",
    label: "Contraseña",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    ...{ 'onKeyup': {} },
    value: (__VLS_ctx.formData.password),
    placeholder: "Ingresa tu contraseña",
    type: "password",
    showPasswordOn: "click",
    size: "large",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_24 = __VLS_23({
    ...{ 'onKeyup': {} },
    value: (__VLS_ctx.formData.password),
    placeholder: "Ingresa tu contraseña",
    type: "password",
    showPasswordOn: "click",
    size: "large",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
let __VLS_26;
let __VLS_27;
let __VLS_28;
const __VLS_29 = {
    onKeyup: (__VLS_ctx.handleLogin)
};
var __VLS_25;
var __VLS_21;
const __VLS_30 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({}));
const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.NCheckbox;
/** @type {[typeof __VLS_components.NCheckbox, typeof __VLS_components.nCheckbox, typeof __VLS_components.NCheckbox, typeof __VLS_components.nCheckbox, ]} */
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    checked: (__VLS_ctx.formData.rememberMe),
}));
const __VLS_36 = __VLS_35({
    checked: (__VLS_ctx.formData.rememberMe),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
var __VLS_37;
var __VLS_33;
const __VLS_38 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({}));
const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
const __VLS_42 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
    block: true,
}));
const __VLS_44 = __VLS_43({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
    block: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
let __VLS_46;
let __VLS_47;
let __VLS_48;
const __VLS_49 = {
    onClick: (__VLS_ctx.handleLogin)
};
__VLS_45.slots.default;
(__VLS_ctx.loading ? 'Iniciando sesión...' : 'Iniciar Sesión');
var __VLS_45;
var __VLS_41;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-footer" },
});
if (__VLS_ctx.error) {
    const __VLS_50 = {}.NAlert;
    /** @type {[typeof __VLS_components.NAlert, typeof __VLS_components.nAlert, ]} */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        type: "error",
        title: (__VLS_ctx.error),
        showIcon: true,
    }));
    const __VLS_52 = __VLS_51({
        type: "error",
        title: (__VLS_ctx.error),
        showIcon: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
}
/** @type {__VLS_StyleScopedClasses['auth-layout']} */
/** @type {__VLS_StyleScopedClasses['auth-container']} */
/** @type {__VLS_StyleScopedClasses['auth-card']} */
/** @type {__VLS_StyleScopedClasses['auth-header']} */
/** @type {__VLS_StyleScopedClasses['auth-title']} */
/** @type {__VLS_StyleScopedClasses['auth-subtitle']} */
/** @type {__VLS_StyleScopedClasses['auth-footer']} */
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formRef: formRef,
            loading: loading,
            error: error,
            formData: formData,
            rules: rules,
            handleLogin: handleLogin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
 /* PartiallyEnd: #4569/main.vue */
