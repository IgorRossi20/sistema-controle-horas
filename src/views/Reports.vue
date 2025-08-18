<template>
  <div class="reports">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Relatórios</h1>
      <div class="btn-group">
        <button 
          class="btn btn-primary" 
          @click="generateReport" 
          :disabled="loading || !selectedMonth || !selectedYear"
        >
          <i class="bi bi-file-earmark-text me-2"></i> Gerar Relatório
        </button>
        <button 
          type="button" 
          class="btn btn-primary dropdown-toggle dropdown-toggle-split" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
          :disabled="loading || !selectedMonth || !selectedYear"
        >
          <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <a class="dropdown-item" href="#" @click.prevent="exportToPDF">
              <i class="bi bi-file-earmark-pdf me-2"></i> Exportar para PDF
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="exportToExcel">
              <i class="bi bi-file-earmark-excel me-2"></i> Exportar para Excel
            </a>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="month" class="form-label">Mês</label>
            <select id="month" v-model="selectedMonth" class="form-select" required>
              <option value="" disabled>Selecione o mês</option>
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>
          
          <div class="col-md-4">
            <label for="year" class="form-label">Ano</label>
            <select id="year" v-model="selectedYear" class="form-select" required>
              <option value="" disabled>Selecione o ano</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label for="project" class="form-label">Projeto</label>
            <select id="project" v-model="selectedProject" class="form-select">
              <option value="">Todos os projetos</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label for="reportType" class="form-label">Tipo de Relatório</label>
            <select id="reportType" v-model="selectedReportType" class="form-select">
              <option value="detailed">Detalhado</option>
              <option value="daily">Resumido por Dia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Relatório -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else-if="!reportData.length && reportGenerated" class="text-center py-5">
          <p class="text-muted mb-3">
            Nenhum registro de horas encontrado para o período selecionado.
          </p>
        </div>
        
        <div v-else-if="reportData.length && reportGenerated">
          <div class="report-header mb-4">
            <h2 class="h4 mb-3">Relatório de Horas Trabalhadas</h2>
            <div class="row">
              <div class="col-md-6">
                <p class="mb-1"><strong>Período:</strong> {{ formatReportPeriod() }}</p>
                <p class="mb-1"><strong>Prestador:</strong> {{ userStore.userName }}</p>
                <p class="mb-1"><strong>Empresa:</strong> Empresa Exemplo</p>
              </div>
              <div class="col-md-6 text-md-end">
                <p class="mb-1"><strong>Total de Horas:</strong> {{ totalHours }}</p>
                <p class="mb-1"><strong>Total de Projetos:</strong> {{ uniqueProjects.length }}</p>
                <p class="mb-1"><strong>Total de Clientes:</strong> {{ uniqueClients.length }}</p>
              </div>
            </div>
          </div>
          
          <!-- Relatório Resumido por Dia -->
          <div v-if="selectedReportType === 'daily'">
            <div v-for="(dayData, date) in displayData" :key="date" class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h3 class="h5 mb-0">{{ date }}</h3>
                <span class="badge bg-primary rounded-pill">{{ dayData.totalHours.toFixed(2) }} horas</span>
              </div>
              
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Cliente(s)</th>
                      <th>Projeto(s)</th>
                      <th>Tipo(s)</th>
                      <th>Descrição das Atividades</th>
                      <th class="text-end">Qtd. Registros</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span v-for="clientId in Array.from(dayData.clients)" :key="clientId" class="badge bg-secondary me-1">
                          {{ getClientName(clientId) }}
                        </span>
                      </td>
                      <td>
                        <span v-for="projectId in Array.from(dayData.projects)" :key="projectId" class="badge bg-info me-1">
                          {{ getProjectName(projectId) }}
                        </span>
                      </td>
                      <td>
                        <span v-for="type in Array.from(dayData.types)" :key="type" class="badge bg-success me-1">
                          {{ getEntryTypeName(type.type, type.customType) }}
                        </span>
                      </td>
                      <td>
                        <div class="small">
                          <div v-for="entry in dayData.entries" :key="entry.id" class="mb-1">
                            • {{ entry.description }} ({{ entry.hours }}h)
                          </div>
                        </div>
                      </td>
                      <td class="text-end">{{ dayData.entries.length }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <!-- Relatório Detalhado -->
          <div v-else>
            <div v-for="(projectData, projectId) in displayData" :key="projectId" class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h3 class="h5 mb-0">{{ getProjectName(projectId) }}</h3>
                <span class="badge bg-primary rounded-pill">{{ projectTotalHours(projectId) }} horas</span>
              </div>
              
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th class="text-end">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="entry in projectData" :key="entry.id">
                      <td>{{ getClientName(entry.clientId) }}</td>
                      <td>{{ formatDate(entry.date) }}</td>
                      <td>
                        <span class="badge bg-success">{{ getEntryTypeName(entry.type, entry.customType) }}</span>
                      </td>
                      <td>{{ entry.description }}</td>
                      <td class="text-end">{{ entry.hours }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-5">
          <p class="text-muted mb-3">Selecione um mês e ano para gerar o relatório.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { timeEntriesService } from '../services/timeEntries'
import { projectsService } from '../services/projects'
import { clientsService } from '../services/clients'
import { exportService } from '../services/export'

const userStore = useUserStore()

// Estado
const loading = ref(false)
const clients = ref([])
const projects = ref([])
const timeEntries = ref([])
const reportData = ref([])
const reportGenerated = ref(false)

// Filtros
const selectedMonth = ref('')
const selectedYear = ref('')
const selectedProject = ref('')
const selectedReportType = ref('detailed')

// Lista de meses
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Lista de anos (últimos 5 anos até o atual)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i).sort((a, b) => b - a)

// Lista de tipos de lançamento
const entryTypes = [
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'meeting_internal', label: 'Reunião Interna' },
  { value: 'meeting_client', label: 'Reunião com Cliente' },
  { value: 'email_check', label: 'Check de Emails' },
  { value: 'planning', label: 'Planejamento' },
  { value: 'testing', label: 'Testes' },
  { value: 'documentation', label: 'Documentação' },
  { value: 'support', label: 'Suporte' },
  { value: 'training', label: 'Treinamento' },
  { value: 'custom', label: 'Lançamento Avulso' }
]

// Computed properties
const filteredEntries = computed(() => {
  if (!selectedMonth.value || !selectedYear.value) return []
  
  let result = [...reportData.value]
  
  // Filtrar por projeto
  if (selectedProject.value) {
    result = result.filter(entry => entry.projectId === selectedProject.value)
  }
  
  return result
})

const groupedEntries = computed(() => {
  const grouped = {}
  
  filteredEntries.value.forEach(entry => {
    // Agrupar por projeto
    if (!grouped[entry.projectId]) {
      grouped[entry.projectId] = []
    }
    
    grouped[entry.projectId].push(entry)
  })
  
  // Ordenar entradas por data dentro de cada projeto
  Object.keys(grouped).forEach(projectId => {
    grouped[projectId].sort((a, b) => {
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
        
        return dateA - dateB
      })
  })
  
  return grouped
})

const totalHours = computed(() => {
  const total = filteredEntries.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.hours)
  }, 0)
  
  return total.toFixed(2)
})

const uniqueProjects = computed(() => {
  const projectIds = new Set(filteredEntries.value.map(entry => entry.projectId))
  return Array.from(projectIds)
})

const uniqueClients = computed(() => {
  const clientIds = new Set(filteredEntries.value.map(entry => entry.clientId))
  return Array.from(clientIds)
})

const displayData = computed(() => {
  if (selectedReportType.value === 'daily') {
    // Para relatório diário, agrupar por data
    const dailyData = {}
    
    filteredEntries.value.forEach(entry => {
      const dateKey = formatDate(entry.date)
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          entries: [],
          totalHours: 0,
          clients: new Set(),
          projects: new Set(),
          types: new Set()
        }
      }
      
      dailyData[dateKey].entries.push(entry)
      dailyData[dateKey].totalHours += parseFloat(entry.hours)
      dailyData[dateKey].clients.add(entry.clientId)
      dailyData[dateKey].projects.add(entry.projectId)
      dailyData[dateKey].types.add({ type: entry.type, customType: entry.customType })
    })
    
    return dailyData
  } else {
    // Para relatório detalhado, usar o agrupamento existente
    return groupedEntries.value
  }
})

// Métodos
const loadData = async () => {
  try {
    const userId = userStore.userId
    
    // Carregar clientes e projetos
    const [clientsData, projectsData] = await Promise.all([
      clientsService.getClients(userId),
      projectsService.getProjects(userId)
    ])
    
    clients.value = clientsData
    projects.value = projectsData
    
    // Definir mês e ano atual como padrão
    const currentDate = new Date()
    selectedMonth.value = currentDate.getMonth() + 1
    selectedYear.value = currentDate.getFullYear()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
}

const generateReport = async () => {
  if (!selectedMonth.value || !selectedYear.value) return
  
  loading.value = true
  reportGenerated.value = true
  
  try {
    const userId = userStore.userId
    const startDate = new Date(selectedYear.value, selectedMonth.value - 1, 1)
    const endDate = new Date(selectedYear.value, selectedMonth.value, 0) // Último dia do mês
    
    // Buscar registros de tempo para o período selecionado
    const entries = await timeEntriesService.getTimeEntriesByPeriod(userId, startDate, endDate)
    reportData.value = entries
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    alert('Ocorreu um erro ao gerar o relatório. Tente novamente.')
  } finally {
    loading.value = false
  }
}

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

const formatReportPeriod = () => {
  if (!selectedMonth.value || !selectedYear.value) return ''
  
  const month = months[selectedMonth.value - 1]
  return `${month} de ${selectedYear.value}`
}

const getClientName = (clientId) => {
  if (!clientId) return 'Sem cliente'
  const client = clients.value.find(c => c.id === clientId)
  return client ? client.name : 'Cliente Desconhecido'
}

const getProjectName = (projectId) => {
  const project = projects.value.find(p => p.id === projectId)
  return project ? project.name : 'Projeto Desconhecido'
}

const getEntryTypeName = (type, customType) => {
  if (type === 'custom' && customType) {
    return customType
  }
  
  const entryType = entryTypes.find(t => t.value === type)
  return entryType ? entryType.label : 'Tipo Desconhecido'
}

const projectTotalHours = (projectId) => {
  const projectEntries = filteredEntries.value.filter(
    entry => entry.projectId === projectId
  )
  
  const total = projectEntries.reduce((sum, entry) => {
    return sum + parseFloat(entry.hours)
  }, 0)
  
  return total.toFixed(2)
}

const exportToPDF = async () => {
  if (!reportData.value.length) {
    alert('Não há dados para exportar. Gere um relatório primeiro.')
    return
  }
  
  try {
    // Preparar dados para exportação
    const reportTitle = `Relatório de Horas - ${formatReportPeriod()}`
    const userName = userStore.userName
    const userCompany = 'Empresa Exemplo'
    
    // Formatar dados para o relatório baseado no tipo selecionado
    let formattedData, headers
    
    if (selectedReportType.value === 'daily') {
      formattedData = exportService.formatDailyReport(
        reportData.value,
        clients.value,
        projects.value
      )
      
      headers = [
        { key: 'data', label: 'Data' },
        { key: 'cliente', label: 'Cliente(s)' },
        { key: 'projeto', label: 'Projeto(s)' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'horas', label: 'Total Horas' },
        { key: 'quantidade_registros', label: 'Qtd. Registros' }
      ]
    } else {
      formattedData = exportService.formatMonthlyReport(
        reportData.value,
        clients.value,
        projects.value
      )
      
      headers = [
        { key: 'cliente', label: 'Cliente' },
        { key: 'projeto', label: 'Projeto' },
        { key: 'data', label: 'Data' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'horas', label: 'Horas' }
      ]
    }
    
    // Exportar para PDF
    await exportService.exportToPDF(
      formattedData,
      reportTitle,
      headers,
      `relatorio-${formatReportPeriod().replace(/\s+/g, '-').toLowerCase()}.pdf`
    )
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error)
    alert('Ocorreu um erro ao exportar para PDF. Tente novamente.')
  }
}

const exportToExcel = async () => {
  if (!reportData.value.length) {
    alert('Não há dados para exportar. Gere um relatório primeiro.')
    return
  }
  
  try {
    // Preparar dados para exportação
    const reportTitle = `Relatório de Horas - ${formatReportPeriod()}`
    const userName = userStore.userName
    const userCompany = 'Empresa Exemplo'
    
    // Formatar dados para o relatório baseado no tipo selecionado
    const formattedData = selectedReportType.value === 'daily' 
      ? exportService.formatDailyReport(reportData.value, clients.value, projects.value)
      : exportService.formatMonthlyReport(reportData.value, clients.value, projects.value)
    
    // Exportar para Excel
    await exportService.exportToExcel(
      formattedData,
      `Relatório ${formatReportPeriod()}`,
      `relatorio-${formatReportPeriod().replace(/\s+/g, '-').toLowerCase()}.xlsx`
    )
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error)
    alert('Ocorreu um erro ao exportar para Excel. Tente novamente.')
  }
}

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.reports {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>