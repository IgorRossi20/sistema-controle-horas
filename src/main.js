import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// Configurar locale para português brasileiro e formato 24 horas
if (typeof navigator !== 'undefined') {
  // Forçar locale brasileiro
  Object.defineProperty(navigator, 'language', {
    get: function() { return 'pt-BR'; },
    configurable: true
  });
  
  Object.defineProperty(navigator, 'languages', {
    get: function() { return ['pt-BR', 'pt', 'en']; },
    configurable: true
  });
}

// Configurar formato de hora 24h globalmente
document.documentElement.setAttribute('lang', 'pt-BR')

// Importando Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Importando estilos globais
import './assets/main.css'

// Configuração do Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Inicializa o Firebase
console.log('🚀 Inicializando Firebase...')

let db = null
let analytics = null

try {
  const firebaseApp = initializeApp(firebaseConfig)
  db = getFirestore(firebaseApp)
  
  // Inicializar Analytics apenas se measurementId estiver disponível
  if (firebaseConfig.measurementId) {
    analytics = getAnalytics(firebaseApp)
  }
  
  console.log('✅ Firebase inicializado com sucesso')
  console.log('🔥 Firestore conectado:', !!db)
  console.log('📊 Analytics ativo:', !!analytics)
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error)
  console.log('⚠️ Verifique as variáveis de ambiente no arquivo .env')
}

console.log('🎉 Aplicação pronta para uso com Firebase!')

// Exporta para uso em outros componentes
export { db, analytics }

// Cria a aplicação Vue
const app = createApp(App)

// Configura Pinia com plugin de persistência
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Configura o router
app.use(router)

// Monta a aplicação
app.mount('#app')