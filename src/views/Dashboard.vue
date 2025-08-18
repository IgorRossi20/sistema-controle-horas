<template>
  <div class="dashboard">
    <h1 class="mb-4">Dashboard</h1>
    
    <div class="row mb-4">
      <div class="col-md-6 mb-3 mb-md-0">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Resumo do Mês</h5>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                <h2 class="mb-0">{{ totalHoursMonth }} horas</h2>
                <p class="text-muted">{{ currentMonthName }}</p>
              </div>
              <div class="display-4 text-primary">
                <i class="bi bi-clock"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Projetos Ativos</h5>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                <h2 class="mb-0">{{ activeProjects.length }}</h2>
                <p class="text-muted">projetos com horas registradas</p>
              </div>
              <div class="display-4 text-primary">
                <i class="bi bi-folder"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Progresso Mensal -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title d-flex align-items-center">
               <i class="bi bi-target me-2"></i>
               Meta Mensal - 180-200 Horas
             </h5>
            
            <div v-if="monthlyProgress" class="mt-3">
              <!-- Barra de Progresso -->
               <div class="d-flex justify-content-between align-items-center mb-2">
                 <span class="fw-bold">{{ monthlyProgress.hoursWorked }} / {{ monthlyProgress.targetHours }} horas</span>
                 <span class="badge" :class="getProgressBadgeClass(monthlyProgress.status)">{{ getProgressStatusText(monthlyProgress.status) }}</span>
               </div>
               <div class="small text-muted mb-2">
                 Faixa ideal: {{ monthlyProgress.monthlyMin }}-{{ monthlyProgress.monthlyTarget }} horas
               </div>
              
              <div class="progress mb-3" style="height: 10px;">
                <div 
                  class="progress-bar" 
                  :class="getProgressBarClass(monthlyProgress.status)"
                  :style="{ width: Math.min(monthlyProgress.progressPercentage, 100) + '%' }"
                  role="progressbar"
                ></div>
              </div>
              
              <!-- Estatísticas -->
              <div class="row text-center">
                <div class="col-md-3 col-6 mb-2">
                  <div class="border-end">
                    <div class="h5 mb-0 text-primary">{{ monthlyProgress.remainingHours }}</div>
                    <small class="text-muted">Horas Restantes</small>
                  </div>
                </div>
                <div class="col-md-3 col-6 mb-2">
                  <div class="border-end">
                    <div class="h5 mb-0 text-info">{{ monthlyProgress.averageHoursPerDay }}</div>
                    <small class="text-muted">Média/Dia Útil</small>
                  </div>
                </div>
                <div class="col-md-3 col-6 mb-2">
                  <div class="border-end">
                    <div class="h5 mb-0 text-success">{{ monthlyProgress.workedDays }}</div>
                    <small class="text-muted">Dias Trabalhados</small>
                  </div>
                </div>
                <div class="col-md-3 col-6 mb-2">
                  <div>
                    <div class="h5 mb-0 text-warning">{{ monthlyProgress.remainingDays }}</div>
                    <small class="text-muted">Dias Restantes</small>
                  </div>
                </div>
              </div>
              
              <!-- Alerta se necessário -->
              <div v-if="monthlyProgress.status === 'exceeded'" class="alert alert-warning mt-3 mb-0">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Atenção!</strong> Você ultrapassou as 200 horas. Considere reduzir o ritmo.
              </div>
              <div v-else-if="monthlyProgress.status === 'completed'" class="alert alert-success mt-3 mb-0">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>Excelente!</strong> Você atingiu a meta ideal de 200 horas!
              </div>
              <div v-else-if="monthlyProgress.status === 'optimal'" class="alert alert-success mt-3 mb-0">
                <i class="bi bi-check-circle me-2"></i>
                <strong>Ótimo!</strong> Você está na faixa ideal entre 180-200 horas.
              </div>
              <div v-else-if="monthlyProgress.status === 'critical'" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Atenção!</strong> Você está muito atrasado para atingir as 180 horas mínimas.
              </div>
              <div v-else-if="monthlyProgress.status === 'behind'" class="alert alert-warning mt-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Cuidado!</strong> Você está atrasado para atingir as 180 horas mínimas.
              </div>
              <div v-else-if="monthlyProgress.status === 'almost-complete'" class="alert alert-success mt-3 mb-0">
                <i class="bi bi-check-circle me-2"></i>
                <strong>Parabéns!</strong> Você está quase atingindo a meta mensal!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Horas por Projeto</h5>
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
              </div>
            </div>
            <div v-else-if="projectHours.length === 0" class="text-center py-5">
              <p class="text-muted">Nenhum registro de horas encontrado para este mês.</p>
              <router-link to="/time-entries" class="btn btn-primary">
                Registrar Horas
              </router-link>
            </div>
            <div v-else>
              <canvas ref="projectChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6 mb-4 mb-md-0">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">Últimos Registros</h5>
              <router-link to="/time-entries" class="btn btn-sm btn-outline-primary">
                Ver Todos
              </router-link>
            </div>
            
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
              </div>
            </div>
            <div v-else-if="recentEntries.length === 0" class="text-center py-4">
              <p class="text-muted">Nenhum registro de horas encontrado.</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Projeto</th>
                    <th>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in recentEntries" :key="entry.id" class="cursor-pointer" @click="viewEntry(entry.id)">
                    <td>{{ formatDate(entry.date) }}</td>
                    <td>{{ getProjectName(entry.projectId) }}</td>
                    <td>{{ entry.hours }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">Ações Rápidas</h5>
            </div>
            
            <div class="d-grid gap-3">
              <router-link to="/time-entries/new" class="btn btn-primary">
                <i class="bi bi-plus-circle me-2"></i> Novo Registro de Horas
              </router-link>
              
              <router-link to="/reports" class="btn btn-outline-primary">
                <i class="bi bi-file-earmark-text me-2"></i> Gerar Relatório
              </router-link>
              
              <router-link to="/clients" class="btn btn-outline-secondary">
                <i class="bi bi-building me-2"></i> Gerenciar Clientes
              </router-link>
              
              <router-link to="/projects" class="btn btn-outline-secondary">
                <i class="bi bi-folder me-2"></i> Gerenciar Projetos
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { timeEntriesService, projectsService, clientsService } from '../services/firebase'
import { Chart, registerables } from 'chart.js'
import { workingDaysService } from '../services/workingDays'

Chart.register(...registerables)

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const userId = userStore.userId
    
    const timeEntries = ref([])
    const projects = ref([])
    const clients = ref([])
    const loading = ref(true)
    const projectChart = ref(null)
    const chartInstance = ref(null)
    
    // Carrega dados quando o componente é montado
    onMounted(async () => {
      await loadData()
    })
    
    // Obter o mês atual
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const currentMonthName = computed(() => {
      return new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' })
    })
    
    // Calcular o primeiro e último dia do mês atual
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    
    // Filtrar entradas do mês atual
    const currentMonthEntries = computed(() => {
      return timeEntries.value.filter(entry => {
        let entryDate
        if (entry.date instanceof Date) {
          entryDate = entry.date
        } else if (typeof entry.date === 'string') {
          entryDate = new Date(entry.date)
        } else if (entry.date && entry.date.seconds) {
          entryDate = new Date(entry.date.seconds * 1000)
        } else {
          entryDate = new Date(entry.date)
        }
        
        return entryDate >= firstDayOfMonth && entryDate <= lastDayOfMonth
      })
    })
    
    // Calcular total de horas do mês
    const totalHoursMonth = computed(() => {
      const total = currentMonthEntries.value.reduce((sum, entry) => {
        return sum + parseFloat(entry.hours)
      }, 0)
      
      return total.toFixed(2)
    })
    
    // Obter projetos ativos (com horas registradas no mês atual)
    const activeProjects = computed(() => {
      const projectIds = [...new Set(currentMonthEntries.value.map(entry => entry.projectId))]
      return projects.value.filter(project => projectIds.includes(project.id))
    })
    
    // Calcular progresso mensal para meta de 200 horas
    const monthlyProgress = computed(() => {
      const hoursWorked = parseFloat(totalHoursMonth.value)
      const currentDate = new Date()
      
      return workingDaysService.getMonthlyProgress(hoursWorked, currentDate)
    })
    
    // Calcular horas por projeto
    const projectHours = computed(() => {
      const hours = {}
      
      currentMonthEntries.value.forEach(entry => {
        if (!hours[entry.projectId]) {
          hours[entry.projectId] = 0
        }
        
        hours[entry.projectId] += parseFloat(entry.hours)
      })
      
      return Object.keys(hours).map(projectId => {
        const project = projects.value.find(p => p.id === projectId)
        return {
          projectId,
          projectName: project ? project.name : 'Projeto Desconhecido',
          hours: hours[projectId]
        }
      }).sort((a, b) => b.hours - a.hours)
    })
    
    // Obter últimos 5 registros
    const recentEntries = computed(() => {
      return [...timeEntries.value]
        .sort((a, b) => {
          let dateA, dateB
          
          if (a.date instanceof Date) {
            dateA = a.date
          } else if (typeof a.date === 'string') {
            dateA = new Date(a.date)
          } else if (a.date && a.date.seconds) {
            dateA = new Date(a.date.seconds * 1000)
          } else {
            dateA = new Date(a.date)
          }
          
          if (b.date instanceof Date) {
            dateB = b.date
          } else if (typeof b.date === 'string') {
            dateB = new Date(b.date)
          } else if (b.date && b.date.seconds) {
            dateB = new Date(b.date.seconds * 1000)
          } else {
            dateB = new Date(b.date)
          }
          
          return dateB - dateA
        })
        .slice(0, 5)
    })
    
    // Formatar data
    const formatDate = (date) => {
      let d
      if (date instanceof Date) {
        d = date
      } else if (typeof date === 'string') {
        d = new Date(date)
      } else if (date && date.seconds) {
        d = new Date(date.seconds * 1000)
      } else {
        d = new Date(date)
      }
      
      // Verificar se a data é válida
      if (isNaN(d.getTime())) {
        return 'Data inválida'
      }
      
      return d.toLocaleDateString('pt-BR')
    }
    
    // Obter nome do projeto
    const getProjectName = (projectId) => {
      const project = projects.value.find(p => p.id === projectId)
      return project ? project.name : 'Projeto Desconhecido'
    }
    
    // Ver detalhes de um registro
    const viewEntry = (entryId) => {
      router.push(`/time-entries/${entryId}`)
    }
    
    // Carregar dados
    const loadData = async () => {
      loading.value = true
      
      try {
        const userId = userStore.userId
        
        // Carregar projetos, clientes e registros de tempo
        const [projectsData, clientsData, timeEntriesData] = await Promise.all([
          projectsService.getProjects(userId),
          clientsService.getClients(userId),
          timeEntriesService.getTimeEntries(userId)
        ])
        
        projects.value = projectsData
        clients.value = clientsData
        timeEntries.value = timeEntriesData
        
        console.log('Dados carregados:', {
          projects: projects.value.length,
          timeEntries: timeEntries.value.length,
          projectHours: projectHours.value
        })
        
        // Aguardar o próximo tick do DOM antes de renderizar o gráfico
        await nextTick()
        renderChart()
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        loading.value = false
      }
    }
    
    // Renderizar gráfico de horas por projeto
    const renderChart = () => {
      console.log('Renderizando gráfico...', {
        projectHours: projectHours.value,
        chartRef: projectChart.value
      })
      
      if (chartInstance.value) {
        chartInstance.value.destroy()
        chartInstance.value = null
      }
      
      if (projectHours.value.length === 0) {
        console.log('Nenhum dado de projeto encontrado')
        return
      }
      
      if (!projectChart.value) {
        console.log('Referência do canvas não encontrada')
        return
      }
      
      try {
        const ctx = projectChart.value.getContext('2d')
        
        chartInstance.value = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: projectHours.value.map(p => p.projectName),
            datasets: [{
              label: 'Horas Trabalhadas',
              data: projectHours.value.map(p => p.hours),
              backgroundColor: 'rgba(13, 110, 253, 0.7)',
              borderColor: 'rgba(13, 110, 253, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Horas'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Projetos'
                }
              }
            }
          }
        })
        
        console.log('Gráfico criado com sucesso:', chartInstance.value)
      } catch (error) {
        console.error('Erro ao criar gráfico:', error)
      }
    }
    
    // Funções de navegação
    const goToNewEntry = () => {
      router.push('/time-entries')
    }
    
    const goToReports = () => {
      router.push('/reports')
    }
    
    const goToClients = () => {
      router.push('/clients')
    }
    
    const goToProjects = () => {
      router.push('/projects')
    }
    
    // Funções auxiliares para o progresso mensal
    const getProgressBadgeClass = (status) => {
      switch (status) {
        case 'exceeded':
          return 'bg-warning'
        case 'completed':
          return 'bg-success'
        case 'almost-complete':
          return 'bg-success'
        case 'optimal':
          return 'bg-success'
        case 'on-track':
          return 'bg-primary'
        case 'behind':
          return 'bg-warning'
        case 'critical':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }
    
    const getProgressBarClass = (status) => {
      switch (status) {
        case 'exceeded':
          return 'bg-warning'
        case 'completed':
          return 'bg-success'
        case 'almost-complete':
          return 'bg-success'
        case 'optimal':
          return 'bg-success'
        case 'on-track':
          return 'bg-primary'
        case 'behind':
          return 'bg-warning'
        case 'critical':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }
    
    const getProgressStatusText = (status) => {
      switch (status) {
        case 'exceeded':
          return 'Acima do Limite'
        case 'completed':
          return 'Meta Ideal Atingida'
        case 'almost-complete':
          return 'Próximo da Meta'
        case 'optimal':
          return 'Faixa Ideal'
        case 'on-track':
          return 'No Caminho'
        case 'behind':
          return 'Atrasado'
        case 'critical':
          return 'Crítico'
        default:
          return 'Indefinido'
      }
    }
    
    return {
      loading,
      currentMonthName,
      totalHoursMonth,
      activeProjects,
      projectHours,
      recentEntries,
      monthlyProgress,
      formatDate,
      getProjectName,
      viewEntry,
      projectChart,
      goToNewEntry,
      goToReports,
      goToClients,
      goToProjects,
      getProgressBadgeClass,
      getProgressBarClass,
      getProgressStatusText
    }
  }
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

canvas {
  min-height: 300px;
  height: 300px;
  width: 100%;
}

.card-body canvas {
  display: block;
  box-sizing: border-box;
}
</style>