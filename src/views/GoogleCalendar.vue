<template>
  <div class="google-calendar-view">
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="fab fa-google me-2 text-primary"></i>
                Google Calendar
              </h2>
              <p class="text-muted mb-0">
                Sincronize seus eventos do Google Calendar com seus registros de horas
              </p>
            </div>
            <div>
              <button
                @click="showHelp = !showHelp"
                class="btn btn-outline-info"
              >
                <i class="fas fa-question-circle me-2"></i>
                Ajuda
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ajuda -->
      <div v-if="showHelp" class="row mb-4">
        <div class="col-12">
          <div class="alert alert-info">
            <h6><i class="fas fa-info-circle me-2"></i>Como configurar a integração:</h6>
            <ol class="mb-2">
              <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Ative a API do Google Calendar</li>
              <li>Crie credenciais OAuth 2.0 para aplicação web</li>
              <li>Adicione <code>{{ currentOrigin }}</code> aos domínios autorizados</li>
              <li>Copie a API Key e Client ID para os campos abaixo</li>
            </ol>
            <p class="mb-0">
              <strong>Nota:</strong> Esta integração permite apenas leitura dos seus calendários.
              Nenhum dado será modificado no Google Calendar.
            </p>
          </div>
        </div>
      </div>

      <!-- Componente de sincronização -->
      <div class="row">
        <div class="col-12">
          <GoogleCalendarSync />
        </div>
      </div>

      <!-- Estatísticas -->
      <div v-if="stats.totalImported > 0" class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-chart-bar me-2"></i>
                Estatísticas de Importação
              </h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-3">
                  <div class="stat-item">
                    <h4 class="text-primary mb-1">{{ stats.totalImported }}</h4>
                    <small class="text-muted">Eventos Importados</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-item">
                    <h4 class="text-success mb-1">{{ stats.totalHours }}h</h4>
                    <small class="text-muted">Horas Totais</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-item">
                    <h4 class="text-info mb-1">{{ stats.lastSync }}</h4>
                    <small class="text-muted">Última Sincronização</small>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-item">
                    <h4 class="text-warning mb-1">{{ stats.calendarsConnected }}</h4>
                    <small class="text-muted">Calendários Conectados</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dicas -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card border-0 bg-light">
            <div class="card-body">
              <h6 class="card-title">
                <i class="fas fa-lightbulb me-2 text-warning"></i>
                Dicas para melhor sincronização
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-unstyled mb-0">
                    <li class="mb-2">
                      <i class="fas fa-check text-success me-2"></i>
                      Use palavras-chave específicas nos títulos dos eventos
                    </li>
                    <li class="mb-2">
                      <i class="fas fa-check text-success me-2"></i>
                      Configure horários precisos de início e fim
                    </li>
                    <li class="mb-0">
                      <i class="fas fa-check text-success me-2"></i>
                      Mantenha um padrão nos nomes dos eventos de trabalho
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-unstyled mb-0">
                    <li class="mb-2">
                      <i class="fas fa-check text-success me-2"></i>
                      Use filtros para excluir eventos pessoais
                    </li>
                    <li class="mb-2">
                      <i class="fas fa-check text-success me-2"></i>
                      Defina cliente e projeto padrão para importação rápida
                    </li>
                    <li class="mb-0">
                      <i class="fas fa-check text-success me-2"></i>
                      Revise os eventos antes de importar
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import GoogleCalendarSync from '../components/GoogleCalendarSync.vue'
import { timeEntriesService } from '../services/timeEntries'
import { useUserStore } from '../store/user'

export default {
  name: 'GoogleCalendar',
  components: {
    GoogleCalendarSync
  },
  setup() {
    const userStore = useUserStore()
    const showHelp = ref(false)
    const timeEntries = ref([])
    
    // Computed properties
    const currentOrigin = computed(() => {
      return window.location.origin
    })
    
    const stats = computed(() => {
      const googleCalendarEntries = timeEntries.value.filter(entry => entry.source === 'google_calendar')
      
      const totalImported = googleCalendarEntries.length
      const totalHours = googleCalendarEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
      
      // Última sincronização (entrada mais recente do Google Calendar)
      const lastSyncEntry = googleCalendarEntries
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0]
      
      const lastSync = lastSyncEntry 
        ? new Date(lastSyncEntry.createdAt).toLocaleDateString('pt-BR')
        : 'Nunca'
      
      // Calendários únicos conectados
      const uniqueCalendars = new Set(
        googleCalendarEntries.map(entry => entry.calendarId).filter(Boolean)
      )
      const calendarsConnected = uniqueCalendars.size || 0
      
      return {
        totalImported,
        totalHours: Math.round(totalHours * 100) / 100,
        lastSync,
        calendarsConnected
      }
    })
    
    // Métodos
    const loadTimeEntries = async () => {
      try {
        timeEntries.value = await timeEntriesService.getTimeEntries(userStore.user.uid)
      } catch (error) {
        console.error('Erro ao carregar registros de horas:', error)
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      await loadTimeEntries()
    })
    
    return {
      showHelp,
      currentOrigin,
      stats
    }
  }
}
</script>

<style scoped>
.google-calendar-view {
  padding: 2rem 0;
}

.stat-item {
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
}

.stat-item h4 {
  font-weight: 600;
  font-size: 1.5rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.alert {
  border-radius: 0.5rem;
}

code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.list-unstyled li {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .google-calendar-view {
    padding: 1rem 0;
  }
  
  .stat-item {
    margin-bottom: 0.5rem;
  }
}
</style>