<template>
  <div class="google-calendar-sync">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-calendar-alt me-2"></i>
          Sincronização com Google Calendar
        </h5>
      </div>
      <div class="card-body">
        <!-- Configuração da API -->
        <div v-if="!isConfigured" class="mb-4">
          <h6>Configuração da API</h6>
          
          <!-- Instruções de ajuda -->
          <div class="alert alert-info mb-3">
            <h6 class="alert-heading"><i class="fas fa-info-circle me-2"></i>Como obter suas credenciais:</h6>
            <ol class="mb-0">
              <li>Acesse o <a href="https://console.developers.google.com" target="_blank">Google Developers Console</a></li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Ative a "Google Calendar API"</li>
              <li>Vá em "Credenciais" → "Criar credenciais"</li>
              <li>Para API Key: escolha "Chave de API"</li>
              <li>Para Client ID: escolha "ID do cliente OAuth 2.0" (Aplicação web)</li>
              <li><strong>Importante:</strong> Adicione <code>http://localhost:5173</code> nas "Origens JavaScript autorizadas"</li>
            </ol>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <label for="apiKey" class="form-label">API Key</label>
              <input
                type="text"
                id="apiKey"
                v-model="config.apiKey"
                class="form-control"
                :class="{ 'is-invalid': config.apiKey && (config.apiKey === 'undefined' || config.apiKey.length < 10) }"
                placeholder="AIzaSy..."
              />
              <div v-if="config.apiKey && config.apiKey === 'undefined'" class="invalid-feedback">
                Valor inválido. Copie a API Key completa do Google Cloud Console.
              </div>
              <div v-else-if="config.apiKey && config.apiKey.length < 10" class="invalid-feedback">
                API Key muito curta. Verifique se copiou corretamente.
              </div>
            </div>
            <div class="col-md-6">
              <label for="clientId" class="form-label">Client ID</label>
              <input
                type="text"
                id="clientId"
                v-model="config.clientId"
                class="form-control"
                :class="{ 'is-invalid': config.clientId && (config.clientId === 'undefined' || config.clientId.length < 20) }"
                placeholder="671213065..."
              />
              <div v-if="config.clientId && config.clientId === 'undefined'" class="invalid-feedback">
                Valor inválido. Copie o Client ID completo do Google Cloud Console.
              </div>
              <div v-else-if="config.clientId && config.clientId.length < 20" class="invalid-feedback">
                Client ID muito curto. Verifique se copiou corretamente.
              </div>
            </div>
          </div>
          <button
            @click="initializeAPI"
            :disabled="!isValidConfig || loading"
            class="btn btn-primary mt-3"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Configurar API
          </button>
        </div>

        <!-- Status da autenticação -->
        <div v-if="isConfigured" class="mb-4">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <h6>Status da Autenticação</h6>
              <span :class="authStatusClass">
                <i :class="authStatusIcon"></i>
                {{ authStatusText }}
              </span>
              <div v-if="currentUser" class="mt-2">
                <small class="text-muted">
                  Conectado como: {{ currentUser.getName() }} ({{ currentUser.getEmail() }})
                </small>
              </div>
            </div>
            <div>
              <button
                v-if="!isSignedIn"
                @click="signIn"
                :disabled="loading"
                class="btn btn-success"
              >
                <i class="fab fa-google me-2"></i>
                Conectar com Google
              </button>
              <button
                v-else
                @click="signOut"
                :disabled="loading"
                class="btn btn-outline-danger"
              >
                <i class="fas fa-sign-out-alt me-2"></i>
                Desconectar
              </button>
            </div>
          </div>
        </div>

        <!-- Configurações de sincronização -->
        <div v-if="isSignedIn" class="mb-4">
          <h6>Configurações de Sincronização</h6>
          
          <!-- Período -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="startDate" class="form-label">Data Inicial</label>
              <input
                type="date"
                id="startDate"
                v-model="syncConfig.startDate"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label for="endDate" class="form-label">Data Final</label>
              <input
                type="date"
                id="endDate"
                v-model="syncConfig.endDate"
                class="form-control"
              />
            </div>
          </div>

          <!-- Calendários -->
          <div class="mb-3">
            <label class="form-label">Calendários</label>
            <div v-if="calendars.length > 0">
              <div v-for="calendar in calendars" :key="calendar.id" class="form-check">
                <input
                  type="checkbox"
                  :id="`calendar-${calendar.id}`"
                  :value="calendar.id"
                  v-model="syncConfig.selectedCalendars"
                  class="form-check-input"
                />
                <label :for="`calendar-${calendar.id}`" class="form-check-label">
                  <span :style="{ color: calendar.backgroundColor }">●</span>
                  {{ calendar.summary }}
                </label>
              </div>
            </div>
            <button
              @click="loadCalendars"
              :disabled="loading"
              class="btn btn-sm btn-outline-primary mt-2"
            >
              <i class="fas fa-refresh me-1"></i>
              Carregar Calendários
            </button>
          </div>

          <!-- Cliente e Projeto padrão -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="defaultClient" class="form-label">Cliente Padrão</label>
              <select
                id="defaultClient"
                v-model="syncConfig.defaultClientId"
                class="form-select"
              >
                <option value="">Selecione um cliente</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="defaultProject" class="form-label">Projeto Padrão</label>
              <select
                id="defaultProject"
                v-model="syncConfig.defaultProjectId"
                class="form-select"
              >
                <option value="">Selecione um projeto</option>
                <option v-for="project in filteredProjects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Filtros -->
          <div class="mb-3">
            <label for="filterKeywords" class="form-label">Palavras-chave para incluir (separadas por vírgula)</label>
            <input
              type="text"
              id="filterKeywords"
              v-model="syncConfig.filterKeywords"
              class="form-control"
              placeholder="reunião, meeting, trabalho"
            />
          </div>

          <div class="mb-3">
            <label for="excludeKeywords" class="form-label">Palavras-chave para excluir (separadas por vírgula)</label>
            <input
              type="text"
              id="excludeKeywords"
              v-model="syncConfig.excludeKeywords"
              class="form-control"
              placeholder="pessoal, personal, férias"
            />
          </div>

          <!-- Botão de sincronização -->
          <div class="d-grid">
            <button
              @click="syncEvents"
              :disabled="loading || syncConfig.selectedCalendars.length === 0"
              class="btn btn-primary btn-lg"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-sync me-2"></i>
              Sincronizar Eventos
            </button>
          </div>
        </div>

        <!-- Resultados da sincronização -->
        <div v-if="syncResults.length > 0" class="mt-4">
          <h6>Eventos Encontrados ({{ syncResults.length }})</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Horas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in syncResults" :key="index">
                  <td>{{ formatDate(entry.date) }}</td>
                  <td>{{ entry.description }}</td>
                  <td>{{ entry.hours }}h</td>
                  <td>
                    <button
                      @click="importEntry(entry)"
                      class="btn btn-sm btn-success me-1"
                      :disabled="loading"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                    <button
                      @click="removeFromResults(index)"
                      class="btn btn-sm btn-outline-danger"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3">
            <button
              @click="importAllEntries"
              :disabled="loading"
              class="btn btn-success me-2"
            >
              <i class="fas fa-download me-2"></i>
              Importar Todos
            </button>
            <button
              @click="clearResults"
              class="btn btn-outline-secondary"
            >
              <i class="fas fa-trash me-2"></i>
              Limpar Resultados
            </button>
          </div>
        </div>

        <!-- Alertas -->
        <div v-if="alert.show" :class="`alert alert-${alert.type} mt-3`">
          <i :class="alert.icon"></i>
          {{ alert.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { googleCalendarService } from '../services/googleCalendar'
import { clientsService } from '../services/clients'
import { projectsService } from '../services/projects'
import { timeEntriesService } from '../services/timeEntries'
import { useUserStore } from '../store/user'

export default {
  name: 'GoogleCalendarSync',
  setup() {
    const userStore = useUserStore()
    
    // Estado reativo
    const loading = ref(false)
    const isConfigured = ref(false)
    const isSignedIn = ref(false)
    const currentUser = ref(null)
    const calendars = ref([])
    const clients = ref([])
    const projects = ref([])
    const syncResults = ref([])
    
    // Configuração da API
    const config = ref({
      apiKey: localStorage.getItem('google_api_key') || '',
      clientId: localStorage.getItem('google_client_id') || ''
    })
    
    // Configuração de sincronização
    const syncConfig = ref({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      selectedCalendars: ['primary'],
      defaultClientId: '',
      defaultProjectId: '',
      filterKeywords: '',
      excludeKeywords: ''
    })
    
    // Alertas
    const alert = ref({
      show: false,
      type: 'info',
      message: '',
      icon: 'fas fa-info-circle'
    })
    
    // Computed properties
    const authStatusClass = computed(() => {
      return isSignedIn.value ? 'badge bg-success' : 'badge bg-warning'
    })
    
    const authStatusIcon = computed(() => {
      return isSignedIn.value ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-triangle me-1'
    })
    
    const authStatusText = computed(() => {
      return isSignedIn.value ? 'Conectado' : 'Não conectado'
    })
    
    const filteredProjects = computed(() => {
      if (!syncConfig.value.defaultClientId) return projects.value
      return projects.value.filter(p => p.clientId === syncConfig.value.defaultClientId)
    })
    
    const isValidConfig = computed(() => {
      const apiKey = config.value.apiKey
      const clientId = config.value.clientId
      
      return apiKey && 
             clientId && 
             apiKey.trim() !== '' && 
             clientId.trim() !== '' && 
             apiKey !== 'undefined' && 
             clientId !== 'undefined' && 
             apiKey.length >= 10 && 
             clientId.length >= 20
    })
    
    // Métodos
    const showAlert = (type, message, icon = null) => {
      alert.value = {
        show: true,
        type,
        message,
        icon: icon || (type === 'success' ? 'fas fa-check-circle' : 
                      type === 'danger' ? 'fas fa-exclamation-triangle' : 
                      'fas fa-info-circle')
      }
      setTimeout(() => {
        alert.value.show = false
      }, 5000)
    }
    
    const initializeAPI = async () => {
      try {
        loading.value = true
        
        await googleCalendarService.initialize(config.value.apiKey, config.value.clientId)
        
        // Salvar configurações
        localStorage.setItem('google_api_key', config.value.apiKey)
        localStorage.setItem('google_client_id', config.value.clientId)
        
        isConfigured.value = true
        showAlert('success', 'API configurada com sucesso!')
      } catch (error) {
        showAlert('danger', `Erro ao configurar API: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    const signIn = async () => {
      try {
        loading.value = true
        await googleCalendarService.signIn()
        isSignedIn.value = true
        currentUser.value = googleCalendarService.getCurrentUser()
        showAlert('success', 'Login realizado com sucesso!')
        await loadCalendars()
      } catch (error) {
        showAlert('danger', `Erro ao fazer login: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    const signOut = async () => {
      try {
        loading.value = true
        await googleCalendarService.signOut()
        isSignedIn.value = false
        currentUser.value = null
        calendars.value = []
        showAlert('info', 'Logout realizado com sucesso!')
      } catch (error) {
        showAlert('danger', `Erro ao fazer logout: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    const loadCalendars = async () => {
      try {
        loading.value = true
        calendars.value = await googleCalendarService.getCalendarList()
        showAlert('success', `${calendars.value.length} calendários carregados!`)
      } catch (error) {
        showAlert('danger', `Erro ao carregar calendários: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    const syncEvents = async () => {
      try {
        loading.value = true
        
        const startDate = new Date(syncConfig.value.startDate)
        const endDate = new Date(syncConfig.value.endDate)
        endDate.setHours(23, 59, 59, 999) // Fim do dia
        
        const options = {
          calendarIds: syncConfig.value.selectedCalendars,
          clientId: syncConfig.value.defaultClientId || null,
          projectId: syncConfig.value.defaultProjectId || null,
          filterKeywords: syncConfig.value.filterKeywords.split(',').map(k => k.trim()).filter(k => k),
          excludeKeywords: syncConfig.value.excludeKeywords.split(',').map(k => k.trim()).filter(k => k)
        }
        
        syncResults.value = await googleCalendarService.syncCalendarEvents(startDate, endDate, options)
        
        showAlert('success', `${syncResults.value.length} eventos encontrados!`)
      } catch (error) {
        showAlert('danger', `Erro ao sincronizar eventos: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    const importEntry = async (entry) => {
      try {
        loading.value = true
        
        // Remover campos específicos do Google Calendar antes de salvar
        const { source, originalEventId, startTime, endTime, location, attendees, ...timeEntry } = entry
        
        await timeEntriesService.addTimeEntry(timeEntry, userStore.user.uid)
        
        showAlert('success', 'Registro importado com sucesso!')
        
        // Remover da lista de resultados
        const index = syncResults.value.findIndex(r => r.originalEventId === entry.originalEventId)
        if (index > -1) {
          syncResults.value.splice(index, 1)
        }
      } catch (error) {
        showAlert('danger', `Erro ao importar registro: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    const importAllEntries = async () => {
      try {
        loading.value = true
        
        for (const entry of syncResults.value) {
          const { source, originalEventId, startTime, endTime, location, attendees, ...timeEntry } = entry
          await timeEntriesService.addTimeEntry(timeEntry, userStore.user.uid)
        }
        
        showAlert('success', `${syncResults.value.length} registros importados com sucesso!`)
        syncResults.value = []
      } catch (error) {
        showAlert('danger', `Erro ao importar registros: ${error.message}`)
      } finally {
        loading.value = false
      }
    }
    
    const removeFromResults = (index) => {
      syncResults.value.splice(index, 1)
    }
    
    const clearResults = () => {
      syncResults.value = []
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('pt-BR')
    }
    
    const loadData = async () => {
      try {
        clients.value = await clientsService.getClients(userStore.user.uid)
        projects.value = await projectsService.getProjects(userStore.user.uid)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      // Verificar se já está configurado
      if (config.value.apiKey && config.value.clientId) {
        try {
          await initializeAPI()
          isSignedIn.value = googleCalendarService.isSignedIn()
          if (isSignedIn.value) {
            currentUser.value = googleCalendarService.getCurrentUser()
          }
        } catch (error) {
          console.error('Erro ao inicializar:', error)
        }
      }
      
      await loadData()
    })
    
    return {
      // Estado
      loading,
      isConfigured,
      isSignedIn,
      currentUser,
      calendars,
      clients,
      projects,
      syncResults,
      config,
      syncConfig,
      alert,
      
      // Computed
      authStatusClass,
      authStatusIcon,
      authStatusText,
      filteredProjects,
      isValidConfig,
      
      // Métodos
      initializeAPI,
      signIn,
      signOut,
      loadCalendars,
      syncEvents,
      importEntry,
      importAllEntries,
      removeFromResults,
      clearResults,
      formatDate
    }
  }
}
</script>

<style scoped>
.google-calendar-sync {
  max-width: 800px;
  margin: 0 auto;
}

.form-check {
  margin-bottom: 0.5rem;
}

.table th {
  border-top: none;
}

.badge {
  font-size: 0.875em;
}

.alert {
  border-radius: 0.375rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>