<template>
  <div class="dashboard">
    <div class="dashboard-header mb-5 animate-fade-in">
      <h1 class="dashboard-title animate-slide-in-left">Dashboard</h1>
      <p class="dashboard-subtitle animate-slide-in-right">Visão geral do seu controle de horas</p>
    </div>
    
    <div class="row mb-4 stagger-children">
      <div class="col-md-6 mb-3 mb-md-0">
        <div class="card modern-card gradient-card h-100 hover-lift transition-all">
          <div class="card-body">
            <div class="card-icon">
              <i class="bi bi-clock"></i>
            </div>
            <h5 class="card-title">Resumo do Mês</h5>
            <div class="metric-container">
              <h2 class="metric-value">{{ totalHoursMonth }}</h2>
              <span class="metric-unit">horas</span>
            </div>
            <p class="metric-period">{{ currentMonthName }}</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card modern-card secondary-card h-100 hover-lift transition-all">
          <div class="card-body">
            <div class="card-icon secondary">
              <i class="bi bi-folder"></i>
            </div>
            <h5 class="card-title">Projetos Ativos</h5>
            <div class="metric-container">
              <h2 class="metric-value">{{ (activeProjects && activeProjects.length) || 0 }}</h2>
              <span class="metric-unit">projetos</span>
            </div>
            <p class="metric-period">com horas registradas</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Progresso Mensal -->
    <div class="row mb-4 animate-fade-in">
      <div class="col-12">
        <div class="card modern-card">
          <div class="card-body">
            <div class="section-header">
              <h5 class="card-title d-flex align-items-center">
                 <i class="bi bi-target me-2"></i>
                 Meta Mensal - 180-200 Horas
               </h5>
              <div class="progress-badge" v-if="monthlyProgress">{{ getProgressStatusText(monthlyProgress.status) }}</div>
            </div>
            
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
                    <small class="text-muted">Horas Restantes do Mês</small>
                    <div v-if="monthlyProgress.isFirstDayReset" class="badge bg-info mt-1">
                      <i class="bi bi-arrow-clockwise me-1"></i>Reset Dia 1º
                    </div>
                  </div>
                </div>
                <div class="col-md-3 col-6 mb-2">
                  <div class="border-end">
                    <div class="h5 mb-0 text-info">{{ monthlyProgress.averageHoursPerDay }}</div>
                    <small class="text-muted">Média/Dia Útil {{ currentMonthName }}</small>
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
                    <small class="text-muted">Dias Restantes do Mês</small>
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
        <div class="card modern-card chart-card">
          <div class="card-body">
            <div class="section-header">
              <h5 class="card-title">Horas por Projeto</h5>
              <div class="chart-info">
                <i class="bi bi-bar-chart"></i>
              </div>
            </div>
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
              </div>
            </div>
            <div v-else-if="(projectHours && projectHours.length === 0) || !projectHours" class="text-center py-5">
              <p class="text-muted">Nenhum registro de horas encontrado para este mês.</p>
              <p class="text-muted small">Debug: {{ (timeEntries && timeEntries.length) || 0 }} registros totais, {{ (currentMonthEntries && currentMonthEntries.length) || 0 }} do mês atual</p>
              <router-link to="/time-entries" class="btn btn-primary">
                Registrar Horas
              </router-link>
            </div>
            <div v-else>
              <p class="text-muted small mb-3">Debug: {{ (projectHours && projectHours.length) || 0 }} projetos com horas</p>
            </div>
            <!-- Canvas sempre presente no DOM -->
            <div v-show="!loading">
              <canvas ref="projectChart" style="height: 300px; width: 100%;"></canvas>
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
            <div v-else-if="(recentEntries && recentEntries.length === 0) || !recentEntries" class="text-center py-4">
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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { timeEntriesService, projectsService } from '../services/firebase'
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

    const loading = ref(true)
    const projectChart = ref(null)
    const chartInstance = ref(null)
    
    // Garantir que os arrays sempre sejam válidos
    watch(timeEntries, (newVal) => {
      if (!Array.isArray(newVal)) {
        console.warn('timeEntries não é um array, corrigindo...', newVal)
        timeEntries.value = []
      }
    }, { immediate: true })
    
    watch(projects, (newVal) => {
      if (!Array.isArray(newVal)) {
        console.warn('projects não é um array, corrigindo...', newVal)
        projects.value = []
      }
    }, { immediate: true })
    
    // Carrega dados quando o componente é montado
    onMounted(async () => {
      try {
        console.log('🚀 Dashboard montado, carregando dados...')
        
        // Garantir que as variáveis estejam inicializadas
        if (!Array.isArray(timeEntries.value)) {
          timeEntries.value = []
        }
        if (!Array.isArray(projects.value)) {
          projects.value = []
        }
        
        console.log('🔧 Componente montado')
        await loadData()
        
        // Aguardar o DOM estar pronto e tentar renderizar o gráfico
        nextTick(() => {
          console.log('🎯 nextTick - projectChart.value:', projectChart.value)
          if (projectChart.value) {
            console.log('✅ Canvas encontrado no DOM')
            // Aguardar um pouco mais para garantir que tudo esteja pronto
            setTimeout(() => {
              console.log('⏰ Tentando renderizar gráfico após timeout')
              renderChart()
            }, 100)
          } else {
            console.log('❌ Canvas não encontrado no DOM')
          }
        })
        
        console.log('✅ Dados carregados com sucesso')
      } catch (error) {
        console.error('❌ Erro durante a montagem do Dashboard:', error)
        // Garantir estado seguro em caso de erro
        timeEntries.value = []
        projects.value = []
        loading.value = false
      }
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
      try {
        if (!timeEntries.value || !Array.isArray(timeEntries.value) || timeEntries.value.length === 0) {
          return []
        }
        
        return timeEntries.value.filter(entry => {
          try {
            if (!entry || typeof entry !== 'object' || !entry.date) {
              return false
            }
            
            let entryDate
            if (entry.date instanceof Date) {
              entryDate = entry.date
            } else if (typeof entry.date === 'string') {
              entryDate = new Date(entry.date)
            } else if (entry.date && typeof entry.date === 'object' && entry.date.seconds) {
              entryDate = new Date(entry.date.seconds * 1000)
            } else {
              entryDate = new Date(entry.date)
            }
            
            // Verificar se a data é válida
            if (isNaN(entryDate.getTime())) {
              return false
            }
            
            return entryDate >= firstDayOfMonth && entryDate <= lastDayOfMonth
          } catch (error) {
            console.warn('Erro ao processar entrada:', entry, error)
            return false
          }
        })
      } catch (error) {
        console.error('Erro em currentMonthEntries:', error)
        return []
      }
    })
    
    // Calcular total de horas do mês
    const totalHoursMonth = computed(() => {
      try {
        if (!currentMonthEntries.value || !Array.isArray(currentMonthEntries.value) || currentMonthEntries.value.length === 0) {
          return '0.00'
        }
        
        const total = currentMonthEntries.value.reduce((sum, entry) => {
          try {
            if (!entry || typeof entry !== 'object' || entry.hours === undefined || entry.hours === null) {
              return sum
            }
            const hours = parseFloat(entry.hours)
            return isNaN(hours) ? sum : sum + hours
          } catch (error) {
            console.warn('Erro ao processar horas da entrada:', entry, error)
            return sum
          }
        }, 0)
        
        return total.toFixed(2)
      } catch (error) {
        console.error('Erro em totalHoursMonth:', error)
        return '0.00'
      }
    })
    
    // Obter projetos ativos (com horas registradas no mês atual)
    const activeProjects = computed(() => {
      try {
        if (!currentMonthEntries.value || !Array.isArray(currentMonthEntries.value) || currentMonthEntries.value.length === 0 ||
            !projects.value || !Array.isArray(projects.value) || projects.value.length === 0) {
          return []
        }
        
        const projectIds = [...new Set(currentMonthEntries.value
          .filter(entry => entry && typeof entry === 'object' && entry.projectId)
          .map(entry => entry.projectId)
          .filter(id => id !== undefined && id !== null))]
          
        return projects.value.filter(project => 
          project && typeof project === 'object' && project.id && projectIds.includes(project.id)
        )
      } catch (error) {
        console.error('Erro em activeProjects:', error)
        return []
      }
    })
    
    // Calcular progresso mensal para meta de 200 horas
    const monthlyProgress = computed(() => {
      const hoursWorked = parseFloat(totalHoursMonth.value)
      const currentDate = new Date()
      
      // Passar os registros do mês atual para calcular dias trabalhados reais
      return workingDaysService.getMonthlyProgress(hoursWorked, currentDate, currentMonthEntries.value)
    })
    
    // Calcular horas por projeto
    const projectHours = computed(() => {
      try {
        if (!currentMonthEntries.value || !Array.isArray(currentMonthEntries.value) || currentMonthEntries.value.length === 0 ||
            !projects.value || !Array.isArray(projects.value) || projects.value.length === 0) {
          return []
        }
        
        const hours = {}
        
        currentMonthEntries.value.forEach(entry => {
          try {
            if (!entry || typeof entry !== 'object' || !entry.projectId || entry.hours === undefined || entry.hours === null) {
              return
            }
            
            const entryHours = parseFloat(entry.hours)
            if (isNaN(entryHours)) {
              return
            }
            
            if (!hours[entry.projectId]) {
              hours[entry.projectId] = 0
            }
            
            hours[entry.projectId] += entryHours
          } catch (error) {
            console.warn('Erro ao processar entrada para projectHours:', entry, error)
          }
        })
        
        return Object.keys(hours).map(projectId => {
          try {
            const project = projects.value.find(p => p && typeof p === 'object' && p.id === projectId)
            return {
              projectId,
              projectName: (project && project.name) ? project.name : 'Projeto Desconhecido',
              hours: hours[projectId] || 0
            }
          } catch (error) {
            console.warn('Erro ao mapear projeto:', projectId, error)
            return {
              projectId,
              projectName: 'Projeto Desconhecido',
              hours: hours[projectId] || 0
            }
          }
        }).sort((a, b) => (b.hours || 0) - (a.hours || 0))
      } catch (error) {
        console.error('Erro em projectHours:', error)
        return []
      }
    })
    
    // Obter últimos 5 registros
    const recentEntries = computed(() => {
      try {
        if (!timeEntries.value || !Array.isArray(timeEntries.value) || timeEntries.value.length === 0) {
          return []
        }
        
        return [...timeEntries.value]
          .filter(entry => entry && typeof entry === 'object' && entry.date)
          .sort((a, b) => {
             try {
               let dateA, dateB
               
               if (a.date instanceof Date) {
                 dateA = a.date
               } else if (typeof a.date === 'string') {
                 dateA = new Date(a.date)
               } else if (a.date && typeof a.date === 'object' && a.date.seconds) {
                 dateA = new Date(a.date.seconds * 1000)
               } else {
                 dateA = new Date(a.date)
               }
               
               if (b.date instanceof Date) {
                 dateB = b.date
               } else if (typeof b.date === 'string') {
                 dateB = new Date(b.date)
               } else if (b.date && typeof b.date === 'object' && b.date.seconds) {
                 dateB = new Date(b.date.seconds * 1000)
               } else {
                 dateB = new Date(b.date)
               }
               
               // Verificar se as datas são válidas
               if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                 return 0
               }
               
               return dateB - dateA
             } catch (error) {
               console.warn('Erro ao ordenar entradas:', a, b, error)
               return 0
             }
           })
           .slice(0, 5)
       } catch (error) {
         console.error('Erro em recentEntries:', error)
         return []
       }
     })
    
    // Formatar data
    const formatDate = (date) => {
      try {
        if (!date) {
          return 'Data inválida'
        }
        
        let d
        if (date instanceof Date) {
          d = date
        } else if (typeof date === 'string') {
          d = new Date(date)
        } else if (date && typeof date === 'object' && date.seconds) {
          d = new Date(date.seconds * 1000)
        } else {
          d = new Date(date)
        }
        
        // Verificar se a data é válida
        if (isNaN(d.getTime())) {
          return 'Data inválida'
        }
        
        return d.toLocaleDateString('pt-BR')
      } catch (error) {
        console.warn('Erro ao formatar data:', date, error)
        return 'Data inválida'
      }
    }
    
    // Obter nome do projeto
    const getProjectName = (projectId) => {
      try {
        if (!projectId || !projects.value || !Array.isArray(projects.value)) {
          return 'Projeto Desconhecido'
        }
        
        const project = projects.value.find(p => p && typeof p === 'object' && p.id === projectId)
        return (project && project.name) ? project.name : 'Projeto Desconhecido'
      } catch (error) {
        console.warn('Erro ao obter nome do projeto:', projectId, error)
        return 'Projeto Desconhecido'
      }
    }
    
    // Ver detalhes de um registro - navegar para a página de registros
    const viewEntry = (entryId) => {
      router.push('/time-entries')
    }
    
    // Função para criar dados de teste se não houver dados
    const createTestData = async () => {
      console.log('🧪 Criando dados de teste...')
      
      // Criar projeto de teste se não existir
    if (!projects.value || !Array.isArray(projects.value) || projects.value.length === 0) {
      const testProject = {
        id: 'test-project-1',
        name: 'Projeto Teste',
        description: 'Projeto para testar o dashboard',
        status: 'active',
        userId: userStore.userId,
        createdAt: new Date().toISOString()
      }
      
      await projectsService.addProject(testProject)
       
       // Garantir que projects.value é um array antes de fazer push
       if (!projects.value || !Array.isArray(projects.value)) {
         projects.value = []
       }
       projects.value.push(testProject)
       console.log('✅ Projeto de teste criado')
     }
     
     // Criar registros de tempo de teste se não existir
     if (!timeEntries.value || !Array.isArray(timeEntries.value) || timeEntries.value.length === 0) {
         const today = new Date()
         const testEntries = [
           {
             id: 'test-entry-1',
             projectId: projects.value[0].id,
             date: today.toISOString().split('T')[0],
             hours: 4,
             description: 'Desenvolvimento de funcionalidades',
             userId: userStore.userId,
             createdAt: new Date().toISOString()
           },
           {
             id: 'test-entry-2',
             projectId: projects.value[0].id,
             date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
             hours: 6,
             description: 'Testes e correções',
             userId: userStore.userId,
             createdAt: new Date().toISOString()
           }
         ]
         
         for (const entry of testEntries) {
           await timeEntriesService.addTimeEntry(entry)
           
           // Garantir que timeEntries.value é um array antes de fazer push
           if (!timeEntries.value || !Array.isArray(timeEntries.value)) {
             timeEntries.value = []
           }
           timeEntries.value.push(entry)
         }
        
        console.log('✅ Registros de teste criados')
      }
    }

    // Carregar dados
    const loadData = async () => {
      loading.value = true
      
      try {
        console.log('🔄 Iniciando carregamento de dados...')
        const userId = userStore.userId
        
        // Carregar projetos e registros de tempo
        const [projectsData, timeEntriesData] = await Promise.all([
          projectsService.getProjects(userId),
          timeEntriesService.getTimeEntries(userId)
        ])
        
        // Verificar se os dados são arrays válidos
        projects.value = Array.isArray(projectsData) ? projectsData : []
        timeEntries.value = Array.isArray(timeEntriesData) ? timeEntriesData : []
        
        // Dados carregados - não criar dados de teste automaticamente
        // Para adicionar dados de teste, use o script add-test-data.js no console
        
        console.log('📦 Dados carregados:', {
          projects: projects.value.length,
          timeEntries: timeEntries.value.length,
          currentMonthEntries: currentMonthEntries.value.length,
          projectHours: projectHours.value.length
        })
        
        console.log('📅 Entradas do mês atual:', currentMonthEntries.value)
        console.log('📊 Dados carregados - projectHours:', projectHours.value)
      } catch (error) {
        console.error('❌ Erro ao carregar dados do dashboard:', error)
        // Garantir que as variáveis tenham valores seguros em caso de erro
        timeEntries.value = []
        projects.value = []
      } finally {
        loading.value = false
      }
    }
    
    // Renderizar gráfico de horas por projeto
    const renderChart = () => {
      try {
        console.log('🎨 renderChart chamada')
        console.log('📊 projectChart.value:', projectChart.value)
        console.log('📈 projectHours.value:', projectHours.value)
        
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
          console.error('❌ Chart.js não está disponível')
          // Tentar carregar Chart.js via CDN como fallback
          loadChartJSFallback()
          return
        }
        
        // Verificar se o canvas existe
        if (!projectChart.value) {
          console.log('❌ Canvas não encontrado')
          return
        }
        
        // Verificar se há dados
        if (!projectHours.value || !Array.isArray(projectHours.value) || projectHours.value.length === 0) {
          console.log('❌ Nenhum dado de projeto encontrado')
          // Mostrar mensagem no canvas em vez de não renderizar nada
          showNoDataMessage()
          return
        }
        
        // Destruir gráfico existente
        if (chartInstance.value) {
          console.log('🗑️ Destruindo gráfico existente')
          try {
            chartInstance.value.destroy()
          } catch (e) {
            console.warn('⚠️ Erro ao destruir gráfico:', e)
          }
          chartInstance.value = null
        }
        
        const ctx = projectChart.value.getContext('2d')
        console.log('🖼️ Context obtido:', !!ctx)
        
        if (!ctx) {
          console.error('❌ Não foi possível obter o contexto 2D do canvas')
          return
        }
        
        // Verificar se todos os itens de dados são válidos
        const validData = projectHours.value.filter(p => 
          p && 
          typeof p === 'object' && 
          typeof p.projectName === 'string' && 
          (typeof p.hours === 'number' || typeof p.hours === 'string') && 
          !isNaN(parseFloat(p.hours))
        )
        
        if (validData.length === 0) {
          console.warn('Nenhum dado válido encontrado para o gráfico')
          showNoDataMessage()
          return
        }
        
        const labels = validData.map(p => p.projectName || 'Sem nome')
        const data = validData.map(p => parseFloat(p.hours) || 0)
        
        console.log('🏷️ Labels:', labels)
        console.log('📊 Data:', data)
        
        // Configuração simplificada do gráfico
        const config = {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Horas',
              data: data,
              backgroundColor: '#0d6efd',
              borderColor: '#0d6efd',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        }
        
        console.log('⚙️ Configuração do gráfico:', config)
        console.log('📦 Chart constructor:', Chart)
        
        chartInstance.value = new Chart(ctx, config)
        
        console.log('✅ Gráfico criado:', !!chartInstance.value)
        
      } catch (error) {
        console.error('❌ Erro ao criar gráfico:', error)
        console.error('Stack trace:', error.stack)
        console.error('Chart disponível:', typeof Chart)
        // Mostrar mensagem de erro no canvas
        showErrorMessage(error.message)
        chartInstance.value = null
      }
    }
    
    // Função para carregar Chart.js como fallback
    const loadChartJSFallback = () => {
      console.log('🔄 Tentando carregar Chart.js via CDN...')
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js'
      script.onload = () => {
        console.log('✅ Chart.js carregado via CDN')
        // Tentar renderizar novamente após 500ms
        setTimeout(renderChart, 500)
      }
      script.onerror = () => {
        console.error('❌ Erro ao carregar Chart.js via CDN')
        showErrorMessage('Erro ao carregar gráficos')
      }
      document.head.appendChild(script)
    }
    
    // Função para mostrar mensagem quando não há dados
    const showNoDataMessage = () => {
      if (!projectChart.value) return
      
      const ctx = projectChart.value.getContext('2d')
      if (!ctx) return
      
      ctx.clearRect(0, 0, projectChart.value.width, projectChart.value.height)
      ctx.fillStyle = '#6c757d'
      ctx.font = '16px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        'Nenhum dado disponível',
        projectChart.value.width / 2,
        projectChart.value.height / 2
      )
    }
    
    // Função para mostrar mensagem de erro
    const showErrorMessage = (message) => {
      if (!projectChart.value) return
      
      const ctx = projectChart.value.getContext('2d')
      if (!ctx) return
      
      ctx.clearRect(0, 0, projectChart.value.width, projectChart.value.height)
      ctx.fillStyle = '#dc3545'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        `Erro: ${message}`,
        projectChart.value.width / 2,
        projectChart.value.height / 2
      )
    }
    
    // Funções de navegação
    const goToNewEntry = () => {
      router.push('/time-entries')
    }
    
    const goToReports = () => {
      router.push('/reports')
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
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dashboard Header */
.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: var(--secondary-color);
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
}

/* Modern Cards */
.modern-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(30, 58, 95, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.modern-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(30, 58, 95, 0.15);
}

.gradient-card {
  background: var(--brand-gradient);
  color: white;
}

.gradient-card .card-title,
.gradient-card .metric-value,
.gradient-card .metric-unit,
.gradient-card .metric-period {
  color: white;
}

.secondary-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid rgba(74, 144, 226, 0.1);
}

.chart-card {
  background: white;
  border: 1px solid rgba(74, 144, 226, 0.1);
}

/* Card Icons */
.card-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.card-icon.secondary {
  background: var(--brand-gradient);
  color: white;
}

/* Metrics */
.metric-container {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 1rem 0;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.metric-unit {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.8;
}

.metric-period {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0;
  font-weight: 500;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.progress-badge {
  background: var(--brand-gradient);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.chart-info {
  color: var(--primary-color);
  font-size: 1.2rem;
}

/* Progress Bars */
.progress {
  height: 12px;
  border-radius: 10px;
  background-color: rgba(74, 144, 226, 0.1);
  overflow: hidden;
}

.progress-bar {
  background: var(--brand-gradient);
  border-radius: 10px;
  transition: width 0.6s ease;
}

/* Canvas */
canvas {
  min-height: 300px;
  height: 300px;
  width: 100%;
  border-radius: 12px;
}

.card-body canvas {
  display: block;
  box-sizing: border-box;
}

/* Buttons */
.btn {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--brand-gradient);
  border: none;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
}

.btn-outline-primary {
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline-primary:hover {
  background: var(--brand-gradient);
  border-color: transparent;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }
  
  .metric-value {
    font-size: 2rem;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>