import { createApp } from 'vue'
import App from './App.vue'

console.log('Iniciando aplicação Vue simples...')

const app = createApp(App)
app.mount('#app')

console.log('Aplicação Vue montada com sucesso!')