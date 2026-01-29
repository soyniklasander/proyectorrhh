import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';
import './assets/styles/main.css';
// Crear instancia de la aplicación
const app = createApp(App);
// Configurar Pinia
const pinia = createPinia();
app.use(pinia);
// Configurar Router
const router = createRouter({
    history: createWebHistory(),
    routes
});
app.use(router);
// Montar la aplicación
app.mount('#app');
