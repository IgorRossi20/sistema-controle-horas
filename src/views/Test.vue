<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-12">
        <h1>🧪 Teste de Funcionamento</h1>
        <div class="alert alert-info">
          <h4>Status da Aplicação:</h4>
          <ul>
            <li>Vue.js: ✅ Funcionando</li>
            <li>Router: ✅ Funcionando</li>
            <li>Pinia Store: {{ storeStatus }}</li>
            <li>Firebase: {{ firebaseStatus }}</li>
            <li>User ID: {{ userId || 'Não encontrado' }}</li>
          </ul>
        </div>
        
        <div class="alert alert-warning">
          <h5>🔍 Diagnóstico do Problema:</h5>
          <p>{{ diagnostico }}</p>
        </div>
        
        <div class="card mt-4">
          <div class="card-header">
            <h5>Dados do Store</h5>
          </div>
          <div class="card-body">
            <pre>{{ JSON.stringify(userStore.user, null, 2) }}</pre>
          </div>
        </div>
        
        <div class="card mt-4">
          <div class="card-header">
            <h5>Teste de Serviços</h5>
          </div>
          <div class="card-body">
            <button @click="testProjects" class="btn btn-primary me-2" :disabled="loading">
              {{ loading ? 'Testando...' : 'Testar Projetos' }}
            </button>
            <button @click="testTimeEntries" class="btn btn-secondary" :disabled="loading">
              {{ loading ? 'Testando...' : 'Testar Registros' }}
            </button>
            
            <div v-if="testResult" class="mt-3">
              <div class="alert" :class="testResult.success ? 'alert-success' : 'alert-danger'">
                <strong>{{ testResult.success ? 'Sucesso:' : 'Erro:' }}</strong>
                {{ testResult.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { projectsService } from '../services/projects'
import { timeEntriesService } from '../services/timeEntries'
import { db } from '../main.js'

const userStore = useUserStore()
const loading = ref(false)
const testResult = ref(null)

const userId = computed(() => userStore.userId)
const storeStatus = computed(() => userStore.user ? '✅ Funcionando' : '❌ Erro')
const firebaseStatus = computed(() => db ? '✅ Conectado' : '❌ Erro de conexão')

const diagnostico = computed(() => {
  if (!db) {
    return 'Firebase não está conectado. Verifique as variáveis de ambiente no arquivo .env'
  }
  if (!userStore.user) {
    return 'Store do usuário não está funcionando. Problema na configuração do Pinia.'
  }
  if (!userId.value) {
    return 'User ID não está disponível. Problema na configuração do usuário padrão.'
  }
  return 'Configuração básica OK. O problema pode estar nos serviços do Firebase ou nas regras de segurança.'
})

const testProjects = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    console.log('🧪 Testando serviço de projetos...')
    const projects = await projectsService.getProjects(userId.value)
    testResult.value = {
      success: true,
      message: `Projetos carregados com sucesso! Total: ${projects.length}`
    }
    console.log('✅ Projetos:', projects)
  } catch (error) {
    console.error('❌ Erro ao testar projetos:', error)
    testResult.value = {
      success: false,
      message: `Erro ao carregar projetos: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

const testTimeEntries = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    console.log('🧪 Testando serviço de registros...')
    const timeEntries = await timeEntriesService.getTimeEntries(userId.value)
    testResult.value = {
      success: true,
      message: `Registros carregados com sucesso! Total: ${timeEntries.length}`
    }
    console.log('✅ Registros:', timeEntries)
  } catch (error) {
    console.error('❌ Erro ao testar registros:', error)
    testResult.value = {
      success: false,
      message: `Erro ao carregar registros: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('🧪 Componente de teste montado')
  console.log('👤 User Store:', userStore.user)
  console.log('🔥 Firebase DB:', db)
  console.log('🆔 User ID:', userId.value)
})
</script>

<style scoped>
pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
</style>