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

// Inicializa o sistema de armazenamento local
console.log('🚀 Inicializando sistema de armazenamento local...')

try {
  localStorageService.initializeData()
  console.log('✅ Sistema de armazenamento local inicializado com sucesso')
  console.log('📊 Dados disponíveis:', {
    clients: localStorageService.queryDocuments('clients', () => true).length,
    projects: localStorageService.queryDocuments('projects', () => true).length,
    timeEntries: localStorageService.queryDocuments('timeEntries', () => true).length
  })
} catch (error) {
  console.error('❌ Erro ao inicializar sistema de armazenamento local:', error)
}

// Mock para compatibilidade com componentes existentes
const db = null
const analytics = null

// Sistema de armazenamento local já inicializado acima
console.log('🎉 Aplicação pronta para uso com armazenamento local!')

// Exporta para uso em outros componentes
export { db, analytics }

// Cria a aplicação Vue
const app = createApp(App)

// Usa Pinia para gerenciamento de estado
app.use(createPinia())

// Configura o router
app.use(router)

// Monta a aplicação
app.mount('#app')