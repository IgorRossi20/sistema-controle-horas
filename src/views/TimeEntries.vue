<template>
  <div class="time-entries">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Registros de Horas</h1>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="bi bi-plus-circle me-2"></i> Novo Registro
      </button>
    </div>
    
    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="month" class="form-label">Mês</label>
            <select id="month" v-model="filters.month" class="form-select">
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }}
              </option>
            </select>
          </div>
          
          <div class="col-md-4">
            <label for="client" class="form-label">Cliente</label>
            <select id="client" v-model="filters.clientId" class="form-select">
              <option value="">Todos os clientes</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>
          
          <div class="col-md-4">
            <label for="project" class="form-label">Projeto</label>
            <select id="project" v-model="filters.projectId" class="form-select">
              <option value="">Todos os projetos</option>
              <option v-for="project in filteredProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tabela de registros -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else-if="filteredEntries.length === 0" class="text-center py-5">
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
                  <th>Cliente</th>
                  <th>Projeto</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Horas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td>{{ formatDate(entry.date) }}</td>
                  <td>{{ getClientName(entry.clientId) }}</td>
                  <td>{{ getProjectName(entry.projectId) }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ getEntryTypeName(entry.type, entry.customType) }}</span>
                  </td>
                  <td class="text-truncate-2" style="max-width: 250px;">
                    {{ entry.description }}
                  </td>
                  <td>{{ entry.hours }}</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="editEntry(entry)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(entry)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-light fw-bold">
                  <td colspan="5" class="text-end">Total de Horas:</td>
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
        <div class="modal-content">
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
                <label for="entry-client" class="form-label">Cliente <span class="text-muted">(opcional)</span></label>
                <select 
                  id="entry-client" 
                  v-model="entryForm.clientId" 
                  class="form-select" 
                  @change="updateProjectOptions"
                >
                  <option value="">Nenhum cliente específico</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }}
                  </option>
                </select>
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
                  <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="entry-type" class="form-label">Tipo de Lançamento</label>
                <select 
                  id="entry-type" 
                  v-model="entryForm.type" 
                  class="form-select" 
                  @change="onTypeChange"
                  required
                >
                  <option value="" disabled>Selecione o tipo</option>
                  <option v-for="type in entryTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                  <option value="custom">Lançamento Avulso (Personalizado)</option>
                </select>
              </div>
              
              <div v-if="entryForm.type === 'custom'" class="mb-3">
                <label for="entry-custom-type" class="form-label">Descrição do Lançamento Avulso</label>
                <input 
                  type="text" 
                  id="entry-custom-type" 
                  v-model="entryForm.customType" 
                  class="form-control" 
                  placeholder="Ex: Reunião com cliente ABC, Análise de requisitos, etc."
                  required
                />
              </div>
              
              <div class="mb-3">
                <label for="entry-hours" class="form-label">Horas</label>
                <input 
                  type="number" 
                  id="entry-hours" 
                  v-model="entryForm.hours" 
                  class="form-control" 
                  step="0.25" 
                  min="0.25" 
                  max="24" 
                  required
                />
              </div>
              
              <div class="mb-3">
                <label for="entry-description" class="form-label">Descrição</label>
                <textarea 
                  id="entry-description" 
                  v-model="entryForm.description" 
                  class="form-control" 
                  rows="3" 
                  required
                ></textarea>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="formLoading">
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
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="deleteEntry" :disabled="formLoading">
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../store/user'
import { timeEntriesService } from '../services/timeEntries'
import { projectsService } from '../services/projects'
import { clientsService } from '../services/clients'

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
const clients = ref([])
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

// Tipos de lançamento predefinidos
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
  { value: 'analysis', label: 'Análise' }
]

// Filtros
const filters = ref({
  month: new Date().getMonth(),
  clientId: '',
  projectId: ''
})

// Formulário
const resetForm = () => {
  return {
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    projectId: '',
    type: '',
    customType: '',
    hours: '',
    description: ''
  }
}

const entryForm = ref(resetForm())
const entryToDelete = ref(null)

// Computed properties
const filteredEntries = computed(() => {
  let result = [...timeEntries.value]
  
  // Filtrar por mês
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
  
  // Filtrar por cliente
  if (filters.value.clientId) {
    result = result.filter(entry => entry.clientId === filters.value.clientId)
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
    return sum + parseFloat(entry.hours)
  }, 0)
  
  return total.toFixed(2)
})

const filteredProjects = computed(() => {
  if (!filters.value.clientId) {
    return projects.value
  }
  
  return projects.value.filter(project => project.clientId === filters.value.clientId)
})

const availableProjects = computed(() => {
  if (!entryForm.value.clientId) {
    return projects.value
  }
  
  return projects.value.filter(project => project.clientId === entryForm.value.clientId)
})

// Métodos
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

const getClientName = (clientId) => {
  if (!clientId) return 'Sem cliente'
  const client = clients.value.find(c => c.id === clientId)
  return client ? client.name : 'Cliente Desconhecido'
}

const getProjectName = (projectId) => {
  const project = projects.value.find(p => p.id === projectId)
  return project ? project.name : 'Projeto Desconhecido'
}

const updateProjectOptions = () => {
  // Resetar o projeto selecionado quando o cliente muda
  entryForm.value.projectId = ''
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
    clientId: entry.clientId,
    projectId: entry.projectId,
    type: entry.type || '',
    customType: entry.customType || '',
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
    const userId = userStore.userId
    const formData = {
      ...entryForm.value,
      date: new Date(entryForm.value.date),
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

const onTypeChange = () => {
  // Limpar o campo customType quando não for tipo personalizado
  if (entryForm.value.type !== 'custom') {
    entryForm.value.customType = ''
  }
}

const getEntryTypeName = (type, customType) => {
  if (type === 'custom') {
    return customType || 'Personalizado'
  }
  
  const typeObj = entryTypes.find(t => t.value === type)
  return typeObj ? typeObj.label : 'Não definido'
}

// Watchers
watch(() => filters.value.clientId, () => {
  // Resetar o filtro de projeto quando o cliente muda
  filters.value.projectId = ''
})

onMounted(async () => {
  await loadData()
  
  // Abrir modal se a prop openModal for true
  if (props.openModal) {
    showAddModal.value = true
  }
})
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.time-entries {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>