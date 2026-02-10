import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import axios from 'axios'

// Configure axios base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173'
axios.defaults.baseURL = API_URL

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
