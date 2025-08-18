import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Importando Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Importando estilos globais
import './assets/main.css'

console.log('🚀 Testando main.js com Bootstrap...')

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

console.log('✅ Aplicação montada com Bootstrap!')