import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Importando Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Importando estilos globais
import './assets/main.css'

// Configuração do sistema de armazenamento local
import localStorageService from './services/localStorage'

console.log('🚀 Testando main.js com localStorage...')
console.log('LocalStorage service:', localStorageService)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

console.log('✅ Aplicação montada com localStorage!')