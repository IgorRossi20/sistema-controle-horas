<template>
  <div class="time-entries">
    <div class="page-header mb-5">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Registros de Horas</h1>
          <p class="page-subtitle">Gerencie seus registros de tempo</p>
        </div>
        <button class="btn btn-primary btn-modern hover-lift transition-all" @click="showAddModal = true">
          <i class="bi bi-plus-circle me-2"></i> Novo Registro
        </button>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="card modern-card mb-4 animate-fade-in hover-lift transition-all">
      <div class="card-body">
        <div class="filter-header mb-3">
          <h5 class="card-title mb-0">
            <i class="bi bi-funnel me-2"></i>
            Filtros
          </h5>
        </div>
        <div class="row g-3">
          <div class="col-md-3">
            <label for="month" class="form-label">Mês</label>
            <select id="month" v-model="filters.month" class="form-select">
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }}
              </option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label for="specific-date" class="form-label">Data Específica</label>
            <div class="input-group">
              <input 
                type="date" 
                id="specific-date" 
                v-model="filters.specificDate" 
                class="form-control"
                placeholder="Selecione uma data"
              />
              <button 
                v-if="filters.specificDate" 
                @click="clearSpecificDate" 
                class="btn btn-outline-secondary" 
                type="button"
                title="Limpar filtro de data"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
          
          <div class="col-md-6">
            <label for="project" class="form-label">Projeto</label>
            <select id="project" v-model="filters.projectId" class="form-select">
              <option value="">Todos os projetos</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tabela de registros -->
    <div class="card modern-card animate-fade-in hover-lift transition-all">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else-if="(!filteredEntries || filteredEntries.length === 0)" class="text-center py-5">
          <p class="text-muted mb-3">Nenhum registro de horas encontrado para os filtros selecionados.</p>
          <button class="btn btn-primary" @click="showAddModal = true">
            Adicionar Registro
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
              <tr>
                <th>Data</th>
                <th>Projeto</th>
                <th>Horário</th>
                <th>Horas</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td>{{ entry && entry.date ? formatDate(entry.date) : '-' }}</td>
                  <td>{{ getProjectNameWrapper(entry.projectId) }}</td>
                  <td>
                      <span v-if="entry.startTime && entry.endTime" class="text-muted small">
                        {{ formatTime(entry.startTime) }} às {{ formatTime(entry.endTime) }}
                      </span>
                      <span v-else class="text-muted small">-</span>
                    </td>
                  <td>{{ formatHoursToText(entry.hours) }}</td>
                  <td class="text-truncate-2" style="max-width: 350px;">
                    {{ entry.description }}
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary transition-all hover-scale" @click="editEntry(entry)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger transition-all hover-scale" @click="confirmDelete(entry)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-light fw-bold">
                  <td colspan="3" class="text-end">
                    {{ filters.specificDate ? `Total do Dia (${formatDateBRLocal(filters.specificDate)}):` : `Total do Mês (${months[filters.month]}):` }}
                  </td>
                  <td>{{ formatHoursToText(totalHours) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <!-- Paginação -->
          <div class="d-flex justify-content-between align-items-center mt-3" v-if="totalPages > 1">
            <div class="d-flex align-items-center">
              <span class="text-muted me-3">
                Mostrando {{ paginationInfo.start }} a {{ paginationInfo.end }} de {{ paginationInfo.total }} registros
              </span>
              <select class="form-select form-select-sm" style="width: auto;" v-model="itemsPerPage" @change="changeItemsPerPage(itemsPerPage)">
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </select>
            </div>
            
            <nav aria-label="Paginação de registros">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="prevPage" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                
                <li v-for="page in Math.min(totalPages, 5)" :key="page" 
                    class="page-item" :class="{ active: currentPage === page }">
                  <button class="page-link" @click="goToPage(page)">
                    {{ page }}
                  </button>
                </li>
                
                <li v-if="totalPages > 5 && currentPage < totalPages - 2" class="page-item disabled">
                  <span class="page-link">...</span>
                </li>
                
                <li v-if="totalPages > 5 && currentPage < totalPages - 1" 
                    class="page-item" :class="{ active: currentPage === totalPages }">
                  <button class="page-link" @click="goToPage(totalPages)">
                    {{ totalPages }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para adicionar/editar registro -->
    <div class="modal fade" :class="{ 'show d-block': showAddModal }" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content modern-modal">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Registro' : 'Novo Registro' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEntry" v-if="entryForm.value">
              <div class="mb-3">
                <label for="entry-date" class="form-label">Data</label>
                <input 
                  type="date" 
                  id="entry-date" 
                  v-model="entryForm.value.date" 
                  class="form-control" 
                  required
                  :placeholder="formatDatePlaceholder()"
                  title="Formato: dd/mm/aaaa"
                />
              </div>
              
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label for="entry-project" class="form-label mb-0">Projeto</label>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm" 
                    @click="showProjectModal = true"
                    title="Cadastrar novo projeto"
                  >
                    <i class="bi bi-plus-circle me-1"></i> Novo Projeto
                  </button>
                </div>
                <div class="position-relative">
                  <input 
                    type="text" 
                    :value="projectSearchText"
                    @input="handleProjectSearch"
                    @focus="showProjectDropdown = true"
                    @blur="hideProjectDropdown"
                    @keydown="handleProjectKeydown"
                    class="form-control" 
                    placeholder="Digite o nome do projeto ou clique para ver todos..."
                    autocomplete="off"
                    required
                  />
                  <div 
                    v-if="showProjectDropdown" 
                    class="dropdown-menu show w-100 position-absolute" 
                    style="max-height: 200px; overflow-y: auto; z-index: 1050;"
                  >
                    <div 
                      v-for="(project, index) in filteredProjects" 
                      :key="project.id" 
                      @mousedown="selectProject(project)"
                      :class="['dropdown-item', { 'active': index === selectedProjectIndex }]"
                      style="cursor: pointer;"
                    >
                      {{ project.name }}
                    </div>
                    <div v-if="filteredProjects.length === 0" class="dropdown-item text-muted">
                      Nenhum projeto encontrado
                    </div>
                  </div>
                </div>
                <small class="text-muted mt-1 d-block">{{ filteredProjects.length }} projeto(s) disponível(eis)</small>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="entry-start-time" class="form-label">Horário de Início (HH:MM)</label>
                  <input 
                    type="text" 
                    id="entry-start-time" 
                    v-model="entryForm.value.startTime" 
                    class="form-control time-input" 
                    required
                    @input="formatTimeInput($event, 'startTime')"
                    @blur="validateTimeInput($event, 'startTime')"
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    title="Formato: HH:MM (00:00 até 23:59)"
                    placeholder="00:00"
                    maxlength="5"
                  />
                </div>
                <div class="col-md-6">
                  <label for="entry-end-time" class="form-label">Horário de Fim (HH:MM)</label>
                  <input 
                    type="text" 
                    id="entry-end-time" 
                    v-model="entryForm.value.endTime" 
                    class="form-control time-input" 
                    required
                    @input="formatTimeInput($event, 'endTime')"
                    @blur="validateTimeInput($event, 'endTime')"
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    title="Formato: HH:MM (00:00 até 23:59)"
                    placeholder="00:00"
                    maxlength="5"
                  />
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Total de Horas</label>
                <div class="form-control-plaintext fw-bold text-primary">
                  {{ formatHoursToText(calculatedHours) }}
                </div>
                <input type="hidden" v-model="entryForm.value.hours" />
              </div>
              
              <div class="mb-3">
                <label for="entry-description" class="form-label">Descrição</label>
                <textarea 
                    id="entry-description" 
                    v-model="entryForm.value.description" 
                    class="form-control" 
                    rows="3"
                ></textarea>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary transition-all hover-scale" :disabled="formLoading">
                  <span v-if="formLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isEditing ? 'Atualizar' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal"></div>
    


    <!-- Modal de confirmação de exclusão -->
    <div class="modal fade" :class="{ 'show d-block': showDeleteModal }" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmar Exclusão</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Tem certeza que deseja excluir este registro?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary transition-all hover-scale" @click="showDeleteModal = false">Cancelar</button>
            <button type="button" class="btn btn-danger transition-all hover-scale" @click="deleteEntry" :disabled="formLoading">
              <span v-if="formLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>

    <!-- Modal de cadastro de projeto -->
    <div class="modal fade" :class="{ 'show d-block': showProjectModal }" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content modern-modal">
          <div class="modal-header">
            <h5 class="modal-title">Novo Projeto</h5>
            <button type="button" class="btn-close" @click="closeProjectModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProject">
              <div class="mb-3">
                <label for="project-name" class="form-label">Nome do Projeto</label>
                <input 
                  type="text" 
                  id="project-name" 
                  v-model="projectForm.name" 
                  class="form-control" 
                  placeholder="Digite o nome do projeto"
                  required
                  maxlength="100"
                />
              </div>
              
              <div class="mb-3">
                <label for="project-description" class="form-label">Descrição (opcional)</label>
                <textarea 
                  id="project-description" 
                  v-model="projectForm.description" 
                  class="form-control" 
                  rows="3"
                  placeholder="Descrição do projeto"
                  maxlength="500"
                ></textarea>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary transition-all hover-scale" :disabled="projectFormLoading">
                  <span v-if="projectFormLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showProjectModal"></div>

  </div>
</template>

<style scoped>
.time-24h::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.time-24h {
  -webkit-appearance: none;
  -moz-appearance: textfield;
  color-scheme: light;
}

.time-24h::-webkit-inner-spin-button,
.time-24h::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Forçar formato 24 horas globalmente */
input[type="time"] {
  color-scheme: light;
}

/* Configurações específicas para navegadores */
:root {
  --time-format: 24;
}

/* Webkit específico para formato 24h */
input[type="time"]::-webkit-datetime-edit-hour-field,
input[type="time"]::-webkit-datetime-edit-minute-field {
  color-scheme: light;
}

/* Firefox específico */
input[type="time"] {
  -moz-appearance: textfield;
}

/* Edge/IE específico */
input[type="time"]::-ms-clear {
  display: none;
}

/* Estilos para campos de entrada de tempo customizados */
.time-input {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  text-align: center;
  letter-spacing: 1px;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.time-input:focus {
  background-color: #fff;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(74, 144, 226, 0.25);
  outline: none;
}

.time-input:valid {
  border-color: #28a745;
}

.time-input:invalid {
  border-color: #dc3545;
}
</style>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '../store/user'
import { timeEntriesService } from '../services/timeEntries'
import { projectsService } from '../services/projects'
import { formatHoursToText, formatDateBR, formatDateStringBR } from '../utils/formatHours'
import { debounceSearch, debounceFilter, SearchCache } from '../utils/debounce'



// Props
const props = defineProps({
  openModal: {
    type: Boolean,
    default: false
  }
})

const userStore = useUserStore()
console.log('UserStore inicializado:', userStore)
console.log('UserStore user:', userStore.user)
console.log('UserStore userId:', userStore.userId)

// Estado
const loading = ref(true)
const formLoading = ref(false)
const timeEntries = ref([])
const projects = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentEntryId = ref(null)
const projectSearchText = ref('')
const showProjectDropdown = ref(false)
const selectedProjectIndex = ref(-1)
const projectSearchCache = new SearchCache(30, 2 * 60 * 1000) // 2 minutos TTL

// Paginação
const currentPage = ref(1)
const itemsPerPage = ref(20)
const totalItems = ref(0)

// Função de busca de projetos com debounce
const debouncedProjectSearch = debounceSearch((searchText) => {
  // A busca real acontece no computed filteredProjects
  // Este debounce apenas controla quando a busca é ativada
  projectSearchText.value = searchText
  currentPage.value = 1 // Reset para primeira página ao buscar
}, 200)

// Debounce para filtros de data e projeto
const debouncedFilterUpdate = debounceFilter(() => {
  // Força recálculo dos filtros
  currentPage.value = 1
}, 300)
const showProjectModal = ref(false)
const projectFormLoading = ref(false)
const projectForm = reactive({
  name: '',
  description: ''
})

// Lista de meses
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]



// Filtros
const filters = ref({
  month: new Date().getMonth(),
  projectId: '',
  specificDate: new Date().toISOString().split('T')[0] // Data de hoje por padrão
})

// Formulário
const resetForm = () => {
  console.log('Resetando formulário...')
  const form = {
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    startTime: '',
    endTime: '',
    hours: '',
    description: ''
  }
  console.log('Formulário resetado:', form)
  return form
}

const entryForm = ref(resetForm())
const entryToDelete = ref(null)

// Cache para projetos ordenados e memoização
let sortedProjectsCache = null
let lastProjectsLength = 0

// Cache para funções custosas
const expensiveFunctionsCache = new Map()
const EXPENSIVE_CACHE_TTL = 2 * 60 * 1000 // 2 minutos

// Função de memoização genérica
const memoize = (fn, keyGenerator, ttl = EXPENSIVE_CACHE_TTL) => {
  return (...args) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    const cached = expensiveFunctionsCache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value
    }
    
    const result = fn(...args)
    expensiveFunctionsCache.set(key, {
      value: result,
      timestamp: Date.now()
    })
    
    return result
  }
}

// Limpar cache de funções custosas periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of expensiveFunctionsCache.entries()) {
    if (now - value.timestamp >= EXPENSIVE_CACHE_TTL) {
      expensiveFunctionsCache.delete(key)
    }
  }
}, 60000) // Limpar a cada minuto

// Computed properties
const filteredProjects = computed(() => {
  const searchTerm = projectSearchText.value?.toLowerCase() || ''
  const cacheKey = `projects_${searchTerm}_${projects.value?.length || 0}`
  
  // Verificar cache primeiro
  const cached = projectSearchCache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  if (!projects.value || !Array.isArray(projects.value)) {
    return []
  }
  
  let result
  if (!searchTerm) {
    result = [...projects.value]
      .filter(project => project && project.name && project.active !== false)
      .sort((a, b) => a.name.localeCompare(b.name))
  } else {
    result = [...projects.value]
      .filter(project => 
        project && project.name && 
        project.active !== false && 
        project.name.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        // Priorizar matches que começam com o termo de busca
        const aStartsWith = a.name.toLowerCase().startsWith(searchTerm)
        const bStartsWith = b.name.toLowerCase().startsWith(searchTerm)
        
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        
        return a.name.localeCompare(b.name)
      })
  }
  
  // Armazenar no cache
  projectSearchCache.set(cacheKey, result)
  return result
})

// Função auxiliar para normalizar datas (memoizada)
const normalizeDateCache = new Map()
const normalizeDate = (date) => {
  if (!date) {
    console.warn('normalizeDate: data vazia, retornando data atual')
    return new Date()
  }
  
  const cacheKey = typeof date === 'object' && date.seconds ? `${date.seconds}` : date.toString()
  if (normalizeDateCache.has(cacheKey)) {
    return normalizeDateCache.get(cacheKey)
  }
  
  let normalizedDate
  try {
    if (date instanceof Date) {
      normalizedDate = date
      console.log('normalizeDate: Date object:', normalizedDate)
    } else if (typeof date === 'string') {
      normalizedDate = new Date(date)
      console.log('normalizeDate: string to Date:', date, '->', normalizedDate)
    } else if (date && date.seconds) {
      normalizedDate = new Date(date.seconds * 1000)
      console.log('normalizeDate: Firestore timestamp:', date.seconds, '->', normalizedDate)
    } else {
      normalizedDate = new Date(date)
      console.log('normalizeDate: fallback conversion:', date, '->', normalizedDate)
    }
    
    // Verificar se a data é válida
    if (isNaN(normalizedDate.getTime())) {
      console.error('normalizeDate: data inválida gerada:', date, '->', normalizedDate)
      normalizedDate = new Date()
    }
  } catch (error) {
    console.error('normalizeDate: erro ao converter data:', date, error)
    normalizedDate = new Date()
  }
  
  normalizeDateCache.set(cacheKey, normalizedDate)
  return normalizedDate
}

// Computed para entradas filtradas (sem paginação)
const allFilteredEntries = computed(() => {
  try {
    console.log('Iniciando allFilteredEntries, timeEntries.value:', timeEntries.value?.length || 0)
    
    // Verificar se timeEntries.value é válido
    if (!timeEntries.value || !Array.isArray(timeEntries.value)) {
      console.warn('timeEntries.value não é um array válido:', timeEntries.value)
      return []
    }
    
    // Filtrar apenas entradas válidas com data
    let result = timeEntries.value.filter(entry => {
      const isValid = entry && 
             typeof entry === 'object' && 
             entry.date !== undefined && 
             entry.date !== null &&
             entry.id !== undefined
      
      if (!isValid) {
        console.warn('Entry inválida encontrada:', entry)
      }
      
      return isValid
    })
    
    console.log('Entries válidas após filtro inicial:', result.length)
    
    // Filtrar por data específica ou por mês
    if (filters.value.specificDate) {
      const [year, month, day] = filters.value.specificDate.split('-').map(Number)
      const selectedDate = new Date(year, month - 1, day)
      const selectedDateString = selectedDate.toDateString()
      
      console.log('Filtrando por data específica:', selectedDateString)
      
      result = result.filter(entry => {
        try {
          const entryDate = normalizeDate(entry.date)
          const matches = entryDate.toDateString() === selectedDateString
          console.log('Entry date:', entryDate.toDateString(), 'matches:', matches)
          return matches
        } catch (error) {
          console.warn('Erro ao filtrar por data específica:', entry, error)
          return false
        }
      })
    } else {
      const targetMonth = filters.value.month
      console.log('Filtrando por mês:', targetMonth)
      
      result = result.filter(entry => {
        try {
          const entryDate = normalizeDate(entry.date)
          const matches = entryDate.getMonth() === targetMonth
          return matches
        } catch (error) {
          console.warn('Erro ao filtrar por mês:', entry, error)
          return false
        }
      })
    }
    
    console.log('Entries após filtro de data:', result.length)
    
    // Filtrar por projeto
    if (filters.value.projectId) {
      const targetProjectId = filters.value.projectId
      console.log('Filtrando por projeto:', targetProjectId)
      result = result.filter(entry => entry.projectId === targetProjectId)
      console.log('Entries após filtro de projeto:', result.length)
    }
    
    // Ordenar por data (mais recente primeiro) - criar nova array apenas se necessário
    const sortedResult = [...result].sort((a, b) => {
      try {
        const dateA = normalizeDate(a.date)
        const dateB = normalizeDate(b.date)
        return dateB - dateA
      } catch (error) {
        console.warn('Erro ao ordenar entradas:', a, b, error)
        return 0
      }
    })
    
    console.log('Resultado final allFilteredEntries:', sortedResult.length)
    // Atualizar total de itens para paginação
    totalItems.value = sortedResult.length
    return sortedResult
  } catch (error) {
    console.error('Erro em allFilteredEntries:', error)
    return []
  }
})

// Computed para entradas paginadas
const filteredEntries = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return allFilteredEntries.value.slice(startIndex, endIndex)
})

// Computed para informações de paginação
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value)
})

const paginationInfo = computed(() => {
  const start = totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, totalItems.value)
  return { start, end, total: totalItems.value }
})

const totalHours = computed(() => {
  const total = allFilteredEntries.value.reduce((sum, entry) => {
    // As horas já estão em formato decimal (ex: 1.50 = 1h30min)
    const hours = parseFloat(entry.hours);
    return isNaN(hours) ? sum : sum + hours;
  }, 0);
  
  return total.toFixed(2);
})

const calculatedHours = computed(() => {
  if (!entryForm.value?.startTime || !entryForm.value?.endTime) {
    return '0.00'
  }
  
  const start = new Date(`2000-01-01T${entryForm.value.startTime}:00`)
  const end = new Date(`2000-01-01T${entryForm.value.endTime}:00`)
  
  // Se o horário de fim for menor que o de início, assumir que passou da meia-noite
  if (end < start) {
    end.setDate(end.getDate() + 1)
  }
  
  const diffMs = end - start
  const totalMinutes = diffMs / (1000 * 60)
  
  // Conversão CORRETA para horas decimais
  const hours = totalMinutes / 60
  
  // Retorna horas em formato decimal (ex: 0.5 para 30 minutos)
  return hours.toFixed(2)
})



// Métodos
// Funções de paginação
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const changeItemsPerPage = (newSize) => {
  itemsPerPage.value = newSize
  currentPage.value = 1 // Reset para primeira página
}

// Função memoizada para calcular horas
const calculateHours = memoize(
  (startTime, endTime) => {
    if (!startTime || !endTime) {
      return null
    }
    
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    // Se o horário de fim for menor que o de início, assumir que passou da meia-noite
    if (end < start) {
      end.setDate(end.getDate() + 1)
    }
    
    const diffMs = end - start
    const totalMinutes = diffMs / (1000 * 60)
    
    // Conversão CORRETA para horas decimais
    const hours = totalMinutes / 60
    
    return hours.toFixed(2)
  },
  (startTime, endTime) => `${startTime}_${endTime}`
)

// Wrapper para manter compatibilidade
const calculateHoursWrapper = () => {
  if (!entryForm.value?.startTime || !entryForm.value?.endTime) {
    return
  }
  
  const hours = calculateHours(entryForm.value.startTime, entryForm.value.endTime)
  if (hours && entryForm.value) {
    entryForm.value.hours = hours
  }
}

const loadData = async () => {
  console.log('Iniciando carregamento de dados...')
  loading.value = true
  
  try {
    const userId = userStore.userId
    console.log('UserStore userId:', userId)
    
    if (!userId) {
      console.error('Usuário não autenticado')
      loading.value = false
      return
    }
    
    console.log('Carregando registros e projetos...')
    // Carregar projetos e registros de tempo com otimizações
    const [projectsData, timeEntriesResponse] = await Promise.all([
      projectsService.getProjects(userId),
      timeEntriesService.getTimeEntries(userId)
    ])
    
    // Verificar se a resposta é do novo formato otimizado
    const timeEntriesData = timeEntriesResponse?.data || timeEntriesResponse
    
    console.log('Dados carregados - Registros:', timeEntriesData?.length || 0, 'Projetos:', projectsData?.length || 0)
    console.log('Dados de registros recebidos:', timeEntriesData)
    
    // Validar dados antes de atribuir
    if (Array.isArray(projectsData)) {
      projects.value = projectsData
    } else {
      console.warn('projectsData não é um array:', projectsData)
      projects.value = []
    }
    
    if (Array.isArray(timeEntriesData)) {
      timeEntries.value = timeEntriesData
      console.log('timeEntries.value atribuído:', timeEntries.value.length, 'registros')
    } else {
      console.warn('timeEntriesData não é um array:', timeEntriesData)
      timeEntries.value = []
    }
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    alert('Erro ao carregar dados. Verifique sua conexão.')
    // Garantir que as variáveis tenham valores padrão em caso de erro
    projects.value = []
    timeEntries.value = []
  } finally {
    loading.value = false
    console.log('Carregamento finalizado. timeEntries.value:', timeEntries.value?.length || 0)
  }
}

const formatDate = formatDateBR

// Função memoizada para formatação de hora
const formatTime = memoize(
  (time) => {
    if (!time) return ''
    
    // Se já está no formato HH:MM, retorna como está
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':')
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
    }
    
    return time
  },
  (time) => time || 'null'
)

// Função memoizada para conversão de 12h para 24h
const convertTo24Hour = memoize(
  (time12h) => {
    if (!time12h) return null
    
    const [time, modifier] = time12h.split(' ')
    let [hours, minutes] = time.split(':')
    
    if (hours === '12') {
      hours = '00'
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  },
  (time12h) => time12h || 'null'
)

const formatTimeInput = (event, field) => {
  let value = event.target.value.replace(/[^0-9]/g, '')
  
  if (value.length >= 3) {
    value = value.substring(0, 2) + ':' + value.substring(2, 4)
  }
  
  event.target.value = value
  if (entryForm.value) {
    entryForm.value[field] = value
  }
  
  // Calcular horas automaticamente se ambos os campos estiverem preenchidos
  if (entryForm.value?.startTime && entryForm.value?.endTime) {
    calculateHoursWrapper()
  }
}

const validateTimeInput = (event, field) => {
  const value = event.target.value
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  
  if (value && !timeRegex.test(value)) {
    // Se não estiver no formato correto, tentar corrigir
    const numbers = value.replace(/[^0-9]/g, '')
    if (numbers.length >= 3) {
      let hours = numbers.substring(0, 2)
      let minutes = numbers.substring(2, 4)
      
      // Validar horas (00-23)
      if (parseInt(hours) > 23) {
        hours = '23'
      }
      
      // Validar minutos (00-59)
      if (parseInt(minutes) > 59) {
        minutes = '59'
      }
      
      const correctedValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
      event.target.value = correctedValue
      if (entryForm.value) {
        entryForm.value[field] = correctedValue
      }
    }
  }
  
  // Calcular horas após validação
  if (entryForm.value?.startTime && entryForm.value?.endTime) {
    calculateHoursWrapper()
  }
}

// Função memoizada para buscar nome do projeto
const getProjectName = memoize(
  (projectId, projectsArray) => {
    if (!projectId) {
      return 'Projeto Desconhecido'
    }
    
    if (!projectsArray || !Array.isArray(projectsArray)) {
      return 'Projeto Desconhecido'
    }
    
    const project = projectsArray.find(p => p && p.id === projectId)
    return project ? project.name : 'Projeto Desconhecido'
  },
  (projectId, projectsArray) => `${projectId}_${projectsArray?.length || 0}`
)

// Wrapper para manter compatibilidade
const getProjectNameWrapper = (projectId) => {
  return getProjectName(projectId, projects.value)
}

const clearSpecificDate = () => {
  filters.value.specificDate = ''
}

const formatDateBRLocal = formatDateStringBR

const formatDatePlaceholder = () => {
  return formatDateBR(new Date())
}

const selectProject = (project) => {
  if (entryForm.value) {
    entryForm.value.projectId = project.id
  }
  projectSearchText.value = project.name
  showProjectDropdown.value = false
  selectedProjectIndex.value = -1
}

const hideProjectDropdown = () => {
  setTimeout(() => {
    showProjectDropdown.value = false
    selectedProjectIndex.value = -1
  }, 150)
}

const handleProjectSearch = (event) => {
  const searchText = event.target.value
  debouncedProjectSearch(searchText)
  selectedProjectIndex.value = -1
  showProjectDropdown.value = true
}

const filterProjects = () => {
  selectedProjectIndex.value = -1
  showProjectDropdown.value = true
}

const handleProjectKeydown = (event) => {
  if (!showProjectDropdown.value) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedProjectIndex.value = Math.min(selectedProjectIndex.value + 1, filteredProjects.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedProjectIndex.value = Math.max(selectedProjectIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedProjectIndex.value >= 0 && filteredProjects.value[selectedProjectIndex.value]) {
        selectProject(filteredProjects.value[selectedProjectIndex.value])
      }
      break
    case 'Escape':
      showProjectDropdown.value = false
      selectedProjectIndex.value = -1
      break
  }
}

const closeProjectModal = () => {
  showProjectModal.value = false
  projectForm.name = ''
  projectForm.description = ''
}

const saveProject = async () => {
  if (!projectForm.name.trim()) {
    alert('Por favor, digite o nome do projeto')
    return
  }

  try {
    projectFormLoading.value = true
    
    const newProject = {
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      userId: userStore.user.uid,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    const projectId = await projectsService.createProject(newProject)
    
    // Adicionar o novo projeto à lista local
    const createdProject = { id: projectId, ...newProject }
    projects.value.push(createdProject)
    
    // Selecionar automaticamente o projeto recém-criado
    entryForm.value.projectId = projectId
    projectSearchText.value = newProject.name
    
    closeProjectModal()
    
    // Mostrar mensagem de sucesso
    alert('Projeto criado com sucesso!')
    
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    alert('Erro ao criar projeto. Tente novamente.')
  } finally {
    projectFormLoading.value = false
  }
}

const closeModal = () => {
  console.log('Fechando modal...')
  showAddModal.value = false
  isEditing.value = false
  currentEntryId.value = null
  entryForm.value = resetForm()
  projectSearchText.value = '' // Limpar filtro de busca
  showProjectDropdown.value = false
  selectedProjectIndex.value = -1
  console.log('Modal fechado, showAddModal:', showAddModal.value)
}

const editEntry = (entry) => {
  if (!entry || typeof entry !== 'object') {
    console.warn('Entry inválida para edição:', entry)
    return
  }
  
  isEditing.value = true
  currentEntryId.value = entry.id
  
  let entryDate;
  if (!entry.date) {
    entryDate = new Date()
  } else if (entry.date instanceof Date) {
    entryDate = entry.date
  } else if (typeof entry.date === 'string') {
    entryDate = new Date(entry.date)
  } else if (entry.date && entry.date.seconds) {
    entryDate = new Date(entry.date.seconds * 1000)
  } else {
    entryDate = new Date(entry.date)
  }
  
  entryForm.value = {
    date: entryDate.toISOString().split('T')[0],
    projectId: entry.projectId,
    startTime: entry.startTime || '',
    endTime: entry.endTime || '',
    hours: entry.hours,
    description: entry.description
  }
  
  // Definir o nome do projeto no campo de busca
  const project = projects.value.find(p => p.id === entry.projectId)
  if (project) {
    projectSearchText.value = project.name
  }
  
  showAddModal.value = true
}

const confirmDelete = (entry) => {
  if (!entry || typeof entry !== 'object') {
    console.warn('Entry inválida para exclusão:', entry)
    return
  }
  entryToDelete.value = entry
  showDeleteModal.value = true
}

const saveEntry = async () => {
  formLoading.value = true
  
  try {
    console.log('Iniciando salvamento do registro:', entryForm.value)
    
    // Validação básica
    if (!entryForm.value || !entryForm.value.date || !entryForm.value.projectId || !entryForm.value.startTime || !entryForm.value.endTime) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      formLoading.value = false
      return
    }
    
    // Validação de horários
    try {
      const start = new Date(`2000-01-01T${entryForm.value?.startTime}:00`)
      const end = new Date(`2000-01-01T${entryForm.value?.endTime}:00`)
      
      if (end <= start && entryForm.value.endTime <= entryForm.value.startTime) {
         alert('O horário de fim deve ser posterior ao horário de início.')
         formLoading.value = false
         return
       }
     } catch (error) {
       console.error('Erro na validação de horários:', error)
       alert('Formato de horário inválido. Use o formato HH:MM.')
       formLoading.value = false
       return
     }
    
    if (parseFloat(entryForm.value?.hours || 0) <= 0) {
      alert('O total de horas deve ser maior que zero.')
      formLoading.value = false
      return
    }
    
    const userId = userStore.userId
    const formData = {
      ...entryForm.value,
      date: new Date(entryForm.value?.date + 'T00:00:00'),
      startTime: entryForm.value?.startTime,
      endTime: entryForm.value?.endTime,
      hours: parseFloat(entryForm.value?.hours || 0).toFixed(2)
    }
    
    if (isEditing.value && currentEntryId.value) {
      // Atualizar registro existente
      await timeEntriesService.updateTimeEntry(currentEntryId.value, formData)
      
      // Atualizar na lista local
      const index = timeEntries.value.findIndex(entry => entry.id === currentEntryId.value)
      if (index !== -1) {
        timeEntries.value[index] = { id: currentEntryId.value, ...formData }
      }
    } else {
      // Adicionar novo registro
      const newEntry = await timeEntriesService.addTimeEntry(formData, userId)
      timeEntries.value.push(newEntry)
    }
    
    console.log('Carregando dados após salvamento...')
    await loadData()
    console.log('Fechando modal...')
    closeModal()
    console.log('Registro salvo com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar registro:', error)
    alert('Erro ao salvar registro. Tente novamente.')
  } finally {
    formLoading.value = false
    console.log('FormLoading resetado para false')
  }
}

const deleteEntry = async () => {
  if (!entryToDelete.value) return
  
  formLoading.value = true
  
  try {
    await timeEntriesService.deleteTimeEntry(entryToDelete.value.id)
    
    // Remover da lista local
    timeEntries.value = timeEntries.value.filter(entry => entry.id !== entryToDelete.value.id)
    
    showDeleteModal.value = false
    entryToDelete.value = null
  } catch (error) {
    console.error('Erro ao excluir registro:', error)
    alert('Ocorreu um erro ao excluir o registro. Tente novamente.')
  } finally {
    formLoading.value = false
  }
}





// Watchers otimizados para filtros
watch(() => filters.value.month, () => {
  debouncedFilterUpdate()
}, { deep: true })

watch(() => filters.value.projectId, () => {
  debouncedFilterUpdate()
}, { deep: true })

watch(() => filters.value.specificDate, () => {
  debouncedFilterUpdate()
}, { deep: true })

onMounted(async () => {
  console.log('Componente TimeEntries montado')
  console.log('Props recebidas:', props)
  
  try {
    await loadData()
    
    // Abrir modal se a prop openModal for true
    if (props.openModal) {
      console.log('Abrindo modal automaticamente')
      showAddModal.value = true
    }
    
    // Configurar formato 24 horas globalmente
    document.documentElement.setAttribute('lang', 'pt-BR')
    
    // Aguardar um pouco para garantir que os elementos estejam renderizados
    setTimeout(() => {
      // Configurar inputs de data para formato brasileiro
      const dateInputs = document.querySelectorAll('input[type="date"]')
      dateInputs.forEach(input => {
        input.setAttribute('lang', 'pt-BR')
        input.setAttribute('data-format', 'dd/mm/yyyy')
        
        // Interceptar o showPicker para configurar o locale
        if (input.showPicker) {
          const originalShowPicker = input.showPicker
          input.showPicker = function() {
            document.documentElement.setAttribute('lang', 'pt-BR')
            document.body.setAttribute('lang', 'pt-BR')
            
            // Adicionar estilo para forçar formato brasileiro
            const style = document.createElement('style')
            style.textContent = `
              input[type="date"] {
                color-scheme: light;
              }
              input[type="date"]::-webkit-calendar-picker-indicator {
                background: none;
              }
            `
            document.head.appendChild(style)
            
            return originalShowPicker.call(this)
          }
        }
      })
      
      // Configurar inputs de tempo para formato 24h
      const timeInputs = document.querySelectorAll('input[type="time"]')
      timeInputs.forEach(input => {
        // Configurações para forçar formato 24h
        input.setAttribute('data-format', '24')
        input.setAttribute('lang', 'pt-BR')
        
        // Interceptar o showPicker para configurar o locale
        if (input.showPicker) {
          const originalShowPicker = input.showPicker
          input.showPicker = function() {
            // Configurar locale antes de abrir o picker
            document.documentElement.setAttribute('lang', 'pt-BR')
            document.body.setAttribute('lang', 'pt-BR')
            
            // Tentar forçar formato 24h via CSS
            const style = document.createElement('style')
            style.textContent = `
              input[type="time"]::-webkit-calendar-picker-indicator {
                background: none;
              }
              input[type="time"] {
                color-scheme: light;
              }
            `
            document.head.appendChild(style)
            
            return originalShowPicker.call(this)
          }
        }
        
        // Adicionar event listener para validar formato
        input.addEventListener('input', function(e) {
          const value = e.target.value
          if (value && value.includes('AM') || value.includes('PM')) {
            // Se detectar AM/PM, converter para 24h
            const time24 = convertTo24Hour(value)
            if (time24) {
              e.target.value = time24
            }
          }
        })
      })
    }, 100)
    
    // Listener para atualizações de registros de tempo
    window.addEventListener('timeEntriesUpdated', loadData)
    
    console.log('Inicialização do componente concluída')
  } catch (error) {
    console.error('Erro durante a inicialização:', error)
  }
})

onUnmounted(() => {
  // Remover listener
  window.removeEventListener('timeEntriesUpdated', loadData)
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

/* Modern Button */
.btn-modern {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
}

.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
}

/* Modern Modal */
.modern-modal {
  border: none;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(30, 58, 95, 0.2);
  overflow: hidden;
}

.modern-modal .modal-header {
  background: var(--brand-gradient);
  color: white;
  border: none;
  padding: 1.5rem;
}

.modern-modal .modal-title {
  font-weight: 600;
  font-size: 1.25rem;
}

.modern-modal .btn-close {
  filter: invert(1);
}

.modern-modal .modal-body {
  padding: 2rem;
}

.modern-modal .modal-footer {
  border: none;
  padding: 1.5rem 2rem;
  background-color: rgba(248, 249, 250, 0.8);
}

/* Table Enhancements */
.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: rgba(74, 144, 226, 0.05);
  transform: scale(1.005);
}

.table tfoot tr {
  background: var(--brand-gradient) !important;
  color: white;
}

.table tfoot td {
  font-weight: 600;
  border: none;
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

/* Text Truncate */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* Modal Backdrop */
.modal {
  background-color: rgba(30, 58, 95, 0.4);
  backdrop-filter: blur(8px);
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
  
  .btn-modern {
    width: 100%;
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }
  
  /* Filter card */
  .filter-header {
    text-align: center;
  }
  
  .row.g-3 .col-md-3,
  .row.g-3 .col-md-6 {
    margin-bottom: 1rem;
  }
  
  .form-control,
  .form-select {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.75rem;
  }
  
  /* Table responsiveness */
  .table-responsive {
    border: none;
    margin: 0 -15px;
  }
  
  .table {
    font-size: 0.8rem;
    margin-bottom: 0;
  }
  
  .table th,
  .table td {
    padding: 0.5rem 0.25rem;
    border-width: 1px;
  }
  
  .table th {
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  /* Hide less important columns on mobile */
  .table .d-none.d-md-table-cell {
    display: none !important;
  }
  
  /* Action buttons in table */
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  /* Modal adjustments */
  .modern-modal .modal-dialog {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .modern-modal .modal-body {
    padding: 1rem;
  }
  
  .modern-modal .modal-header {
    padding: 1rem;
  }
  
  .modern-modal .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modern-modal .modal-footer .btn {
    width: 100%;
  }
  
  /* Form in modal */
  .modal .row.mb-3 .col-md-6 {
    margin-bottom: 1rem;
  }
  
  .modal textarea {
    min-height: 80px;
  }
  
  /* Total hours display */
  .text-end {
    text-align: center !important;
    margin-top: 1rem;
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
  
  .btn-modern {
    width: auto;
  }
  
  .table {
    font-size: 0.875rem;
  }
  
  .table th,
  .table td {
    padding: 0.6rem 0.4rem;
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
  
  .row.g-3 .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
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
  
  /* Pagination adjustments */
  .pagination {
    justify-content: center;
  }
  
  .pagination .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  /* Alert adjustments */
  .alert {
    padding: 0.75rem;
    font-size: 0.875rem;
    text-align: center;
  }
  
  /* Loading states */
  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
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
  
  .modern-modal .modal-dialog {
    margin: 0.5rem;
  }
  
  .modern-modal .modal-body {
    max-height: 60vh;
    overflow-y: auto;
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
  
  /* Larger touch targets */
  .table .btn {
    min-width: 44px;
    min-height: 44px;
  }
}

.time-entries {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>