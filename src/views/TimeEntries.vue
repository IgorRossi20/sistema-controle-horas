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
                  <td>{{ formatDate(entry.date) }}</td>
                  <td>{{ getProjectName(entry.projectId) }}</td>
                  <td>
                      <span v-if="entry.startTime && entry.endTime" class="text-muted small">
                        {{ formatTime(entry.startTime) }} às {{ formatTime(entry.endTime) }}
                      </span>
                      <span v-else class="text-muted small">-</span>
                    </td>
                  <td>{{ entry.hours }}h</td>
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
                    {{ filters.specificDate ? `Total do Dia (${formatDateBR(filters.specificDate)}):` : `Total do Mês (${months[filters.month]}):` }}
                  </td>
                  <td>{{ totalHours }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
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
            <form @submit.prevent="saveEntry">
              <div class="mb-3">
                <label for="entry-date" class="form-label">Data</label>
                <input 
                  type="date" 
                  id="entry-date" 
                  v-model="entryForm.date" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="mb-3">
                <label for="entry-project" class="form-label">Projeto</label>
                <select 
                  id="entry-project" 
                  v-model="entryForm.projectId" 
                  class="form-select" 
                  required
                >
                  <option value="" disabled>Selecione um projeto</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="entry-start-time" class="form-label">Horário de Início (HH:MM)</label>
                  <input 
                    type="text" 
                    id="entry-start-time" 
                    v-model="entryForm.startTime" 
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
                    v-model="entryForm.endTime" 
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
                  {{ calculatedHours }} horas
                </div>
                <input type="hidden" v-model="entryForm.hours" />
              </div>
              
              <div class="mb-3">
                <label for="entry-description" class="form-label">Descrição</label>
                <textarea 
                  id="entry-description" 
                  v-model="entryForm.description" 
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '../store/user'
import { timeEntriesService } from '../services/timeEntries'
import { projectsService } from '../services/projects'



// Props
const props = defineProps({
  openModal: {
    type: Boolean,
    default: false
  }
})

const userStore = useUserStore()

// Estado
const loading = ref(true)
const formLoading = ref(false)
const timeEntries = ref([])
const projects = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentEntryId = ref(null)

// Lista de meses
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]



// Filtros
const filters = ref({
  month: new Date().getMonth(),
  projectId: '',
  specificDate: ''
})

// Formulário
const resetForm = () => {
  return {
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    startTime: '',
    endTime: '',
    hours: '',
    description: ''
  }
}

const entryForm = ref(resetForm())
const entryToDelete = ref(null)

// Computed properties
const filteredEntries = computed(() => {
  let result = [...timeEntries.value]
  
  // Filtrar por data específica ou por mês
  if (filters.value.specificDate) {
    // Se uma data específica foi selecionada, filtrar por essa data
    result = result.filter(entry => {
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
      
      const selectedDate = new Date(filters.value.specificDate)
      return entryDate.toDateString() === selectedDate.toDateString()
    })
  } else {
    // Se não há data específica, filtrar por mês
    result = result.filter(entry => {
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
      
      return entryDate.getMonth() === filters.value.month
    })
  }
  
  // Filtrar por projeto
  if (filters.value.projectId) {
    result = result.filter(entry => entry.projectId === filters.value.projectId)
  }
  
  // Ordenar por data (mais recente primeiro)
  return result.sort((a, b) => {
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
})

const totalHours = computed(() => {
  const total = filteredEntries.value.reduce((sum, entry) => {
    // As horas já estão em formato decimal (ex: 1.50 = 1h30min)
    const hours = parseFloat(entry.hours);
    return isNaN(hours) ? sum : sum + hours;
  }, 0);
  
  return total.toFixed(2);
})

const calculatedHours = computed(() => {
  if (!entryForm.value.startTime || !entryForm.value.endTime) {
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
  
  // Conversão CORRETA para formato H.MM
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  // Formato H.MM onde MM são os minutos reais
  const result = hours + (minutes / 100)
  return result.toFixed(2)
})



// Métodos
const calculateHours = () => {
  if (entryForm.value.startTime && entryForm.value.endTime) {
    entryForm.value.hours = calculatedHours.value
  }
}

const loadData = async () => {
  loading.value = true
  
  try {
    const userId = userStore.userId
    
    // Carregar projetos e registros de tempo
    const [projectsData, timeEntriesData] = await Promise.all([
      projectsService.getProjects(userId),
      timeEntriesService.getTimeEntries(userId)
    ])
    
    projects.value = projectsData
    timeEntries.value = timeEntriesData
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
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

const formatTime = (time) => {
  if (!time) return ''
  
  // Se já está no formato HH:MM, retorna como está
  if (time.includes(':')) {
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }
  
  return time
}

const convertTo24Hour = (time12h) => {
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
}

const formatTimeInput = (event, field) => {
  let value = event.target.value.replace(/[^0-9]/g, '')
  
  if (value.length >= 3) {
    value = value.substring(0, 2) + ':' + value.substring(2, 4)
  }
  
  event.target.value = value
  entryForm.value[field] = value
  
  // Calcular horas automaticamente se ambos os campos estiverem preenchidos
  if (entryForm.value.startTime && entryForm.value.endTime) {
    calculateHours()
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
      entryForm.value[field] = correctedValue
    }
  }
  
  // Calcular horas após validação
  if (entryForm.value.startTime && entryForm.value.endTime) {
    calculateHours()
  }
}

const getProjectName = (projectId) => {
  const project = projects.value.find(p => p.id === projectId)
  return project ? project.name : 'Projeto Desconhecido'
}

const clearSpecificDate = () => {
  filters.value.specificDate = ''
}

const formatDateBR = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  currentEntryId.value = null
  entryForm.value = resetForm()
}

const editEntry = (entry) => {
  isEditing.value = true
  currentEntryId.value = entry.id
  
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
  
  entryForm.value = {
    date: entryDate.toISOString().split('T')[0],
    projectId: entry.projectId,
    startTime: entry.startTime || '',
    endTime: entry.endTime || '',
    hours: entry.hours,
    description: entry.description
  }
  
  showAddModal.value = true
}

const confirmDelete = (entry) => {
  entryToDelete.value = entry
  showDeleteModal.value = true
}

const saveEntry = async () => {
  formLoading.value = true
  
  try {
    // Validação básica
    if (!entryForm.value.date || !entryForm.value.projectId || !entryForm.value.startTime || !entryForm.value.endTime) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    // Validação de horários
    const start = new Date(`2000-01-01T${entryForm.value.startTime}:00`)
    const end = new Date(`2000-01-01T${entryForm.value.endTime}:00`)
    
    if (end <= start && entryForm.value.endTime <= entryForm.value.startTime) {
      alert('O horário de fim deve ser posterior ao horário de início.')
      return
    }
    
    if (parseFloat(entryForm.value.hours) <= 0) {
      alert('O total de horas deve ser maior que zero.')
      return
    }
    
    const userId = userStore.userId
    const formData = {
      ...entryForm.value,
      date: new Date(entryForm.value.date + 'T00:00:00'),
      startTime: entryForm.value.startTime,
      endTime: entryForm.value.endTime,
      hours: parseFloat(entryForm.value.hours).toFixed(2)
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
    
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar registro:', error)
    alert('Ocorreu um erro ao salvar o registro. Tente novamente.')
  } finally {
    formLoading.value = false
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





onMounted(async () => {
  await loadData()
  
  // Abrir modal se a prop openModal for true
  if (props.openModal) {
    showAddModal.value = true
  }
  
  // Configurar formato 24 horas globalmente
  document.documentElement.setAttribute('lang', 'pt-BR')
  
  // Aguardar um pouco para garantir que os elementos estejam renderizados
  setTimeout(() => {
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

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn-modern {
    width: 100%;
  }
  
  .modern-modal .modal-body {
    padding: 1.5rem;
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