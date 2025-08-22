<template>
  <div class="reports">
    <div class="page-header mb-5">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Relatórios</h1>
          <p class="page-subtitle">Gere relatórios detalhados de suas horas trabalhadas</p>
        </div>
      </div>
    </div>
    
    <!-- Ações -->
    <div class="d-flex justify-content-end mb-4 actions-container">
      <div class="btn-group actions-btn-group">
        <button 
          class="btn btn-primary hover-lift transition-all" 
          @click="generateReport" 
          :disabled="loading || !selectedMonth || !selectedYear"
        >
          <i class="bi bi-file-earmark-text me-2"></i> 
          <span class="d-none d-sm-inline">Gerar Relatório</span>
          <span class="d-sm-none">Gerar</span>
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
    <div class="card modern-card mb-4 animate-fade-in hover-lift transition-all">
      <div class="card-body">
        <div class="filter-header mb-3">
          <h5 class="card-title mb-0">
            <i class="bi bi-funnel me-2"></i>
            Filtros do Relatório
          </h5>
        </div>
        <div class="row g-3 filters-row">
          <div class="col-12 col-sm-6 col-lg-3">
            <label for="specific-date" class="form-label">Data Específica</label>
            <div class="input-group">
              <input 
                id="specific-date" 
                type="date" 
                v-model="selectedSpecificDate" 
                class="form-control"
                placeholder="Selecione uma data"
              />
              <button 
                v-if="selectedSpecificDate" 
                @click="clearSpecificDate" 
                class="btn btn-outline-secondary" 
                type="button"
                title="Limpar filtro de data"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
          
          <div class="col-12 col-sm-6 col-lg-3">
            <label for="month" class="form-label">Mês</label>
            <select id="month" v-model="selectedMonth" class="form-select" :disabled="!!selectedSpecificDate">
              <option value="" disabled>Selecione o mês</option>
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>
          
          <div class="col-12 col-sm-6 col-lg-3">
            <label for="year" class="form-label">Ano</label>
            <select id="year" v-model="selectedYear" class="form-select" :disabled="!!selectedSpecificDate">
              <option value="" disabled>Selecione o ano</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          
          <div class="col-12 col-sm-6 col-lg-3">
            <label for="project" class="form-label">Projeto</label>
            <select id="project" v-model="selectedProject" class="form-select">
              <option value="">Todos os projetos</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
          
          <div class="col-12 col-sm-6 col-lg-3">
            <label for="reportType" class="form-label">Tipo de Relatório</label>
            <select id="reportType" v-model="selectedReportType" class="form-select">
              <option value="daily">Resumido por Dia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Relatório -->
    <div class="card modern-card animate-scale-in hover-lift transition-all">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else-if="(!reportData || !reportData.length) && reportGenerated" class="text-center py-5">
          <p class="text-muted mb-3">
            Nenhum registro de horas encontrado para o período selecionado.
          </p>
        </div>
        
        <div v-else-if="reportData && reportData.length && reportGenerated">
          <div class="report-header mb-4">
            <div class="d-flex justify-content-between align-items-start mb-3 report-header-top">
              <div class="report-info">
                <h2 class="report-title">Relatório de Horas - {{ formatReportPeriod() }}</h2>
                <p class="report-subtitle">Total de {{ totalHours }} horas trabalhadas</p>
              </div>
              <div class="btn-group export-buttons" role="group">
                <button @click="exportToPDF" class="btn btn-outline-primary btn-modern">
                  <i class="bi bi-file-earmark-pdf me-1"></i> 
                  <span class="d-none d-sm-inline">PDF</span>
                </button>
                <button @click="exportToExcel" class="btn btn-outline-success btn-modern">
                  <i class="bi bi-file-earmark-excel me-1"></i> 
                  <span class="d-none d-sm-inline">Excel</span>
                </button>
              </div>
            </div>
            <div class="row report-details">
              <div class="col-12 col-md-6">
                <p class="mb-1"><strong>Período:</strong> {{ formatReportPeriod() }}</p>
                <p class="mb-1"><strong>Prestador:</strong> {{ userStore.userName }}</p>
                <p class="mb-1"><strong>Empresa:</strong> Empresa Exemplo</p>
              </div>
              <div class="col-12 col-md-6 text-md-end">
                <p class="mb-1"><strong>Total de Horas:</strong> {{ formatHoursToText(totalHours) }}</p>
                <p class="mb-1"><strong>Total de Projetos:</strong> {{ (uniqueProjects && uniqueProjects.length) || 0 }}</p>
              </div>
            </div>
          </div>
          
          <!-- Relatório Resumido por Dia -->
          <div v-if="selectedReportType === 'daily'">
            <div v-for="(dayData, date) in displayData" :key="date" class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h3 class="h5 mb-0">{{ date }}</h3>
                <span class="badge bg-primary rounded-pill">{{ formatHoursToText(dayData.totalHours) }}</span>
              </div>
              
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Projeto(s)</th>
                      <th>Descrição das Atividades</th>
                      <th class="text-end d-none d-md-table-cell">Qtd. Registros</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span v-for="projectId in Array.from(dayData.projects)" :key="projectId" class="badge bg-info me-1">
                          {{ getProjectName(projectId) }}
                        </span>
                      </td>
                      <td>
                        <div class="small">
                          <div v-for="entry in dayData.entries" :key="entry.id" class="mb-1">
                            • {{ entry.description }} ({{ entry.hours }}h)
                          </div>
                        </div>
                        <div class="d-md-none mt-2">
                          <small class="text-muted">{{ dayData.entries.length }} registro(s)</small>
                        </div>
                      </td>
                      <td class="text-end d-none d-md-table-cell">{{ dayData.entries.length }}</td>
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
                <span class="badge bg-primary rounded-pill">{{ formatHoursToText(projectTotalHours(projectId)) }}</span>
              </div>
              
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead class="table-light">
                    <tr>
                      <th class="d-none d-md-table-cell">Data</th>
                      <th>Descrição</th>
                      <th class="text-end">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="entry in projectData" :key="entry.id">
                      <td class="d-none d-md-table-cell">{{ formatDate(entry.date) }}</td>
                      <td>
                        <div>{{ entry.description }}</div>
                        <div class="d-md-none">
                          <small class="text-muted">{{ formatDate(entry.date) }}</small>
                        </div>
                      </td>
                      <td class="text-end">{{ formatHoursToText(entry.hours) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <!-- Assinatura do Relatório -->
          <div class="report-signature mt-5 pt-4 border-top">
            <div class="text-center">
              <p class="mb-0 text-muted"><strong>Relatório de horas PJ - Igor Rossi Nunes</strong></p>
              <p class="mb-0 text-muted small">Gerado em: {{ new Date().toLocaleDateString('pt-BR') }}</p>
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
import { exportService } from '../services/export'
import { formatHoursToText } from '../utils/formatHours'

const userStore = useUserStore()

// Estado
const loading = ref(false)
const projects = ref([])
const timeEntries = ref([])
const reportData = ref([])
const reportGenerated = ref(false)

// Filtros
const selectedMonth = ref('')
const selectedYear = ref('')
const selectedProject = ref('')
const selectedReportType = ref('daily')
const selectedSpecificDate = ref('')

// Lista de meses
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Lista de anos (últimos 5 anos até o atual)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i).sort((a, b) => b - a)



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
  
  // Verificar se filteredEntries é um array válido
  if (!filteredEntries.value || !Array.isArray(filteredEntries.value)) {
    return grouped
  }
  
  filteredEntries.value.forEach(entry => {
    // Verificar se entry é válido
    if (!entry || typeof entry !== 'object' || !entry.projectId) {
      return
    }
    
    // Agrupar por projeto
    if (!grouped[entry.projectId]) {
      grouped[entry.projectId] = []
    }
    
    grouped[entry.projectId].push(entry)
  })
  
  // Ordenar entradas por data dentro de cada projeto
  Object.keys(grouped).forEach(projectId => {
    // Verificar se o array do projeto é válido
    if (!grouped[projectId] || !Array.isArray(grouped[projectId])) {
      return
    }
    
    grouped[projectId].sort((a, b) => {
      // Verificar se a e b são objetos válidos
      if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
        return 0
      }
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
  // Verificar se filteredEntries é um array válido
  if (!filteredEntries.value || !Array.isArray(filteredEntries.value)) {
    return '0.00'
  }
  
  const total = filteredEntries.value.reduce((sum, entry) => {
    // Verificar se entry é válido e tem hours
    if (!entry || typeof entry !== 'object' || entry.hours === undefined || entry.hours === null) {
       return sum
     }
    
    // As horas já estão em formato decimal (ex: 1.50 = 1h30min)
    const hours = parseFloat(entry.hours);
    return isNaN(hours) ? sum : sum + hours;
  }, 0);
  
  return total.toFixed(2);
})

const uniqueProjects = computed(() => {
  // Verificar se filteredEntries é um array válido
  if (!filteredEntries.value || !Array.isArray(filteredEntries.value)) {
    return []
  }
  
  const projectIds = new Set(
    filteredEntries.value
      .filter(entry => entry && typeof entry === 'object' && entry.projectId)
      .map(entry => entry.projectId)
  )
  return Array.from(projectIds)
})



const displayData = computed(() => {
  if (selectedReportType.value === 'daily') {
    // Para relatório diário, agrupar por data
    const dailyData = {}
    
    // Verificar se filteredEntries é um array válido
    if (!filteredEntries.value || !Array.isArray(filteredEntries.value)) {
      return dailyData
    }
    
    filteredEntries.value.forEach(entry => {
      // Verificar se entry é válido
      if (!entry || typeof entry !== 'object' || !entry.date) {
        return
      }
      const dateKey = formatDate(entry.date)
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          entries: [],
          totalHours: 0,
          projects: new Set()
        }
      }
      
      dailyData[dateKey].entries.push(entry)
      
      // As horas já estão em formato decimal (ex: 1.50 = 1h30min)
      const hours = parseFloat(entry.hours);
      if (!isNaN(hours)) {
        dailyData[dateKey].totalHours += hours;
      }
      
      dailyData[dateKey].projects.add(entry.projectId)
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
    
    // Carregar projetos
    const projectsData = await projectsService.getProjects(userId)
    
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
  // Verificar se temos data específica ou mês/ano
  if (!selectedSpecificDate.value && (!selectedMonth.value || !selectedYear.value)) {
    alert('Selecione uma data específica ou um mês e ano para gerar o relatório.')
    return
  }
  
  loading.value = true
  reportGenerated.value = true
  
  try {
    const userId = userStore.userId
    let startDate, endDate
    
    if (selectedSpecificDate.value) {
      // Filtrar por data específica
      // Criar data a partir da string no formato YYYY-MM-DD
      const [year, month, day] = selectedSpecificDate.value.split('-').map(Number)
      startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
      endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
    } else {
      // Filtrar por mês/ano
      startDate = new Date(selectedYear.value, selectedMonth.value - 1, 1)
      endDate = new Date(selectedYear.value, selectedMonth.value, 0, 23, 59, 59) // Último dia do mês
    }
    
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

const clearSpecificDate = () => {
  selectedSpecificDate.value = ''
}

const formatReportPeriod = () => {
  if (selectedSpecificDate.value) {
    const date = new Date(selectedSpecificDate.value)
    return date.toLocaleDateString('pt-BR')
  } else if (selectedMonth.value && selectedYear.value) {
    return `${months[selectedMonth.value - 1]} de ${selectedYear.value}`
  }
  return 'Período Selecionado'
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



const formatHoursFromMinutes = (totalMinutes) => {
  if (!totalMinutes) return '0.00'
  
  // Conversão CORRETA para horas decimais
  const hoursDecimal = totalMinutes / 60
  return hoursDecimal.toFixed(2)
}



const getProjectName = (projectId) => {
  // Verificar se projects é um array válido
  if (!projects.value || !Array.isArray(projects.value)) {
    return 'Projeto Desconhecido'
  }
  
  const project = projects.value.find(p => p && typeof p === 'object' && p.id === projectId)
  return (project && project.name) ? project.name : 'Projeto Desconhecido'
}



const projectTotalHours = (projectId) => {
  // Verificar se filteredEntries é um array válido
  if (!filteredEntries.value || !Array.isArray(filteredEntries.value)) {
    return '0.00'
  }
  
  const projectEntries = filteredEntries.value.filter(
    entry => entry && typeof entry === 'object' && entry.projectId === projectId
  )
  
  const total = projectEntries.reduce((sum, entry) => {
    // Verificar se entry é válido e tem hours
    if (!entry || typeof entry !== 'object' || entry.hours === undefined || entry.hours === null) {
      return sum
    }
    
    // As horas já estão em formato decimal (ex: 1.50 = 1h30min)
    const hours = parseFloat(entry.hours);
    return isNaN(hours) ? sum : sum + hours;
  }, 0);
  
  return total.toFixed(2);
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
    
    // Verificar se projects é um array válido
    const validProjects = projects.value && Array.isArray(projects.value) ? projects.value : []
    
    if (selectedReportType.value === 'daily') {
      formattedData = exportService.formatDailyReport(
        reportData.value,
        validProjects
      )
      
      headers = [
        { key: 'data', label: 'Data' },
        { key: 'projeto', label: 'Projeto(s)' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'horas', label: 'Total Horas' },
        { key: 'quantidade_registros', label: 'Qtd. Registros' }
      ]
    } else {
      formattedData = exportService.formatMonthlyReport(
        reportData.value,
        validProjects
      )
      
      headers = [
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
  // Verificar se reportData é um array válido
  if (!reportData.value || !Array.isArray(reportData.value) || !reportData.value.length) {
    alert('Não há dados para exportar. Gere um relatório primeiro.')
    return
  }
  
  try {
    // Preparar dados para exportação
    const reportTitle = `Relatório de Horas - ${formatReportPeriod()}`
    const userName = userStore.userName
    const userCompany = 'Empresa Exemplo'
    
    // Verificar se projects é um array válido
    const validProjects = projects.value && Array.isArray(projects.value) ? projects.value : []
    
    // Formatar dados para o relatório baseado no tipo selecionado
    const formattedData = selectedReportType.value === 'daily' 
      ? exportService.formatDailyReport(reportData.value, validProjects)
      : exportService.formatMonthlyReport(reportData.value, validProjects)
    
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
/* Page Header */
.page-header {
  text-align: left;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--secondary-color);
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
}

/* Filter Header */
.filter-header {
  border-bottom: 2px solid rgba(74, 144, 226, 0.1);
  padding-bottom: 0.75rem;
}

.filter-header .card-title {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.1rem;
}

/* Report Header */
.report-header {
  border-bottom: 2px solid rgba(74, 144, 226, 0.1);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.report-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.report-subtitle {
  color: var(--secondary-color);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

/* Report Signature */
.report-signature {
  border-top: 1px solid rgba(74, 144, 226, 0.2);
  margin-top: 2rem;
  padding-top: 1.5rem;
}

.report-signature p {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.report-signature .small {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Modern Button */
.btn-modern {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.btn-primary.btn-modern {
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.btn-primary.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
}

.btn-outline-primary.btn-modern {
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline-primary.btn-modern:hover {
  background: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.btn-outline-success.btn-modern {
  border: 2px solid #28a745;
  color: #28a745;
}

.btn-outline-success.btn-modern:hover {
  background: #28a745;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

/* Status Badges */
.badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.bg-primary {
  background: var(--brand-gradient) !important;
}

.bg-info {
  background: linear-gradient(135deg, #17a2b8, #138496) !important;
}

/* Tables */
.table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.05);
}

.table thead th {
  background: var(--bg-secondary);
  color: var(--dark-color);
  font-weight: 600;
  border: none;
  padding: 1rem;
}

.table tbody td {
  padding: 1rem;
  border-color: rgba(74, 144, 226, 0.1);
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: rgba(74, 144, 226, 0.05);
}

/* Button Groups */
.btn-group .btn {
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
}

.btn-group .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animation */
.reports {
  animation: fadeIn 0.5s ease;
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

/* Actions Container */
.actions-container {
  flex-wrap: wrap;
  gap: 0.5rem;
}

.actions-btn-group {
  flex-wrap: wrap;
}

/* Filters Row */
.filters-row {
  margin-bottom: 1rem;
}

/* Report Header */
.report-header-top {
  flex-wrap: wrap;
  gap: 1rem;
}

.report-info {
  flex: 1;
  min-width: 0;
}

.export-buttons {
  flex-shrink: 0;
}

.report-details {
  margin-top: 1rem;
}

/* Responsive Styles */

/* Mobile Portrait (max-width: 575px) */
@media (max-width: 575.98px) {
  .page-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  /* Filter controls */
  .report-header {
    text-align: center;
  }
  
  .report-header .d-flex {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .row.g-3 .col-md-3,
  .row.g-3 .col-md-4,
  .row.g-3 .col-md-6 {
    margin-bottom: 1rem;
  }
  
  .form-control,
  .form-select {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.75rem;
  }
  
  /* Actions container mobile */
  .actions-container {
    justify-content: center;
  }
  
  .actions-btn-group {
    width: 100%;
    justify-content: center;
  }
  
  /* Button groups */
  .btn-group {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-group .btn {
    width: 100%;
    margin: 0;
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }
  
  /* Report header mobile */
  .report-header-top {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .export-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .export-buttons .btn {
    flex: 1;
    margin: 0 0.25rem;
  }
  
  /* Export buttons */
  .btn-modern {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  /* Chart container */
  .chart-container {
    padding: 1rem;
    margin: 0 -15px;
  }
  
  .chart-container canvas {
    max-height: 250px !important;
  }
  
  /* Table responsiveness */
  .table-responsive {
    border: none;
    margin: 0 -15px;
    font-size: 0.8rem;
  }
  
  .table {
    margin-bottom: 0;
  }
  
  .table th,
  .table td {
    padding: 0.5rem 0.25rem;
    border-width: 1px;
    font-size: 0.75rem;
  }
  
  .table th {
    font-weight: 600;
    background-color: var(--primary-color);
    color: white;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  /* Hide less important columns on mobile */
  .table .d-none.d-md-table-cell {
    display: none !important;
  }
  
  /* Summary cards */
  .modern-card {
    margin-bottom: 1rem;
    padding: 1rem;
  }
  
  .metric-value {
    font-size: 1.5rem;
  }
  
  .metric-label {
    font-size: 0.8rem;
  }
  
  /* Alert adjustments */
  .alert {
    padding: 0.75rem;
    font-size: 0.875rem;
    text-align: center;
    margin: 1rem 0;
  }
  
  /* Loading states */
  .text-center {
    padding: 2rem 1rem;
  }
  
  .spinner-border {
    width: 2rem;
    height: 2rem;
  }
}

/* Mobile Landscape (576px to 767px) */
@media (min-width: 576px) and (max-width: 767.98px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-header .d-flex {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .report-header .d-flex {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .btn-group {
    width: auto;
    flex-direction: row;
  }
  
  .btn-group .btn {
    width: auto;
    flex: 1;
  }
  
  .table {
    font-size: 0.875rem;
  }
  
  .table th,
  .table td {
    padding: 0.6rem 0.4rem;
  }
  
  .chart-container canvas {
    max-height: 300px !important;
  }
}

/* Tablet (768px to 991px) */
@media (min-width: 768px) and (max-width: 991.98px) {
  .page-title {
    font-size: 2rem;
  }
  
  /* Adjust filter grid for tablets */
  .row.g-3 .col-md-3 {
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .row.g-3 .col-md-4 {
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .row.g-3 .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .chart-container canvas {
    max-height: 350px !important;
  }
}

/* General mobile optimizations (768px and below) */
@media (max-width: 768px) {
  /* Improve touch targets */
  .btn {
    min-height: 44px;
  }
  
  /* Card spacing */
  .modern-card {
    margin-bottom: 1rem;
  }
  
  /* Better spacing for filters */
  .card-body {
    padding: 1rem;
  }
  
  /* Chart responsiveness */
  .chart-container {
    overflow-x: auto;
  }
  
  /* Table improvements */
  .table-responsive {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Summary section */
  .row .col-md-3,
  .row .col-md-4,
  .row .col-md-6 {
    margin-bottom: 1rem;
  }
  
  /* Export section */
  .export-section {
    text-align: center;
    margin-top: 2rem;
  }
  
  .export-section .btn {
    margin: 0.25rem;
    width: calc(50% - 0.5rem);
  }
}

/* Landscape orientation specific */
@media (max-height: 500px) and (orientation: landscape) {
  .page-header {
    margin-bottom: 1rem;
  }
  
  .modern-card {
    margin-bottom: 0.5rem;
  }
  
  .chart-container {
    padding: 0.5rem;
  }
  
  .chart-container canvas {
    max-height: 200px !important;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .btn:hover {
    transform: none;
  }
  
  .modern-card:hover {
    transform: none;
  }
  
  .btn-group .btn:hover {
    transform: none;
  }
  
  /* Larger touch targets for table actions */
  .table .btn {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Print optimizations */
@media print {
  .page-header,
  .report-header,
  .btn,
  .btn-group {
    display: none !important;
  }
  
  .chart-container,
  .table-responsive {
    margin: 0;
    padding: 0;
  }
  
  .modern-card {
    break-inside: avoid;
    margin-bottom: 1rem;
  }
}
</style>