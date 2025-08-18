<template>
  <div class="projects">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Projetos</h1>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="bi bi-plus-circle me-2"></i> Novo Projeto
      </button>
    </div>
    
    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label for="client-filter" class="form-label">Filtrar por Cliente</label>
            <select id="client-filter" v-model="clientFilter" class="form-select">
              <option value="">Todos os clientes</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>
          
          <div class="col-md-6">
            <label for="status-filter" class="form-label">Status</label>
            <select id="status-filter" v-model="statusFilter" class="form-select">
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Lista de projetos -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else-if="filteredProjects.length === 0" class="text-center py-5">
          <p class="text-muted mb-3">Nenhum projeto encontrado para os filtros selecionados.</p>
          <button class="btn btn-primary" @click="showAddModal = true">
            Adicionar Projeto
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Horas Registradas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in filteredProjects" :key="project.id">
                  <td>{{ project.name }}</td>
                  <td>{{ getClientName(project.clientId) }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(project.status)">
                      {{ getStatusLabel(project.status) }}
                    </span>
                  </td>
                  <td>
                    {{ getProjectHours(project.id) }}
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="editProject(project)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="confirmDelete(project)"
                        :disabled="hasTimeEntries(project.id)"
                        :title="hasTimeEntries(project.id) ? 'Projeto possui horas registradas' : 'Excluir projeto'"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para adicionar/editar projeto -->
    <div class="modal fade" :class="{ 'show d-block': showAddModal }" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Projeto' : 'Novo Projeto' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
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
                  required
                />
              </div>
              
              <div class="mb-3">
                <label for="project-client" class="form-label">Cliente</label>
                <select 
                  id="project-client" 
                  v-model="projectForm.clientId" 
                  class="form-select" 
                  required
                >
                  <option value="" disabled>Selecione um cliente</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="project-status" class="form-label">Status</label>
                <select 
                  id="project-status" 
                  v-model="projectForm.status" 
                  class="form-select" 
                  required
                >
                  <option value="active">Ativo</option>
                  <option value="completed">Concluído</option>
                  <option value="paused">Pausado</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="project-description" class="form-label">Descrição</label>
                <textarea 
                  id="project-description" 
                  v-model="projectForm.description" 
                  class="form-control" 
                  rows="3"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="project-hourly-rate" class="form-label">Valor Hora (R$)</label>
                <input 
                  type="number" 
                  id="project-hourly-rate" 
                  v-model="projectForm.hourlyRate" 
                  class="form-control" 
                  step="0.01" 
                  min="0"
                />
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
            <p>Tem certeza que deseja excluir o projeto <strong>{{ projectToDelete?.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="deleteProject" :disabled="formLoading">
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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { projectsService } from '../services/projects'
import { clientsService } from '../services/clients'
import { timeEntriesService } from '../services/timeEntries'

const userStore = useUserStore()

// Estado
const loading = ref(true)
const formLoading = ref(false)
const projects = ref([])
const clients = ref([])
const timeEntries = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentProjectId = ref(null)
const projectToDelete = ref(null)

// Filtros
const clientFilter = ref('')
const statusFilter = ref('')

// Formulário
const resetForm = () => {
  return {
    name: '',
    clientId: '',
    status: 'active',
    description: '',
    hourlyRate: ''
  }
}

const projectForm = ref(resetForm())

// Computed properties
const filteredProjects = computed(() => {
  let result = [...projects.value]
  
  // Filtrar por cliente
  if (clientFilter.value) {
    result = result.filter(project => project.clientId === clientFilter.value)
  }
  
  // Filtrar por status
  if (statusFilter.value) {
    result = result.filter(project => project.status === statusFilter.value)
  }
  
  // Ordenar por nome
  return result.sort((a, b) => a.name.localeCompare(b.name))
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

const getClientName = (clientId) => {
  const client = clients.value.find(c => c.id === clientId)
  return client ? client.name : 'Cliente Desconhecido'
}

const getStatusLabel = (status) => {
  const statusMap = {
    'active': 'Ativo',
    'completed': 'Concluído',
    'paused': 'Pausado'
  }
  
  return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    'active': 'badge bg-success',
    'completed': 'badge bg-secondary',
    'paused': 'badge bg-warning text-dark'
  }
  
  return classMap[status] || 'badge bg-secondary'
}

const getProjectHours = (projectId) => {
  const projectEntries = timeEntries.value.filter(entry => entry.projectId === projectId)
  
  const totalHours = projectEntries.reduce((sum, entry) => {
    return sum + parseFloat(entry.hours)
  }, 0)
  
  return totalHours.toFixed(2)
}

const hasTimeEntries = (projectId) => {
  return timeEntries.value.some(entry => entry.projectId === projectId)
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  currentProjectId.value = null
  projectForm.value = resetForm()
}

const editProject = (project) => {
  isEditing.value = true
  currentProjectId.value = project.id
  
  projectForm.value = {
    name: project.name,
    clientId: project.clientId,
    status: project.status || 'active',
    description: project.description || '',
    hourlyRate: project.hourlyRate || ''
  }
  
  showAddModal.value = true
}

const confirmDelete = (project) => {
  if (hasTimeEntries(project.id)) return
  
  projectToDelete.value = project
  showDeleteModal.value = true
}

const saveProject = async () => {
  formLoading.value = true
  
  try {
    const userId = userStore.userId
    const formData = { 
      ...projectForm.value,
      hourlyRate: projectForm.value.hourlyRate ? parseFloat(projectForm.value.hourlyRate) : null
    }
    
    if (isEditing.value && currentProjectId.value) {
      // Atualizar projeto existente
      await projectsService.updateProject(currentProjectId.value, formData)
      
      // Atualizar na lista local
      const index = projects.value.findIndex(project => project.id === currentProjectId.value)
      if (index !== -1) {
        projects.value[index] = { id: currentProjectId.value, ...formData }
      }
    } else {
      // Adicionar novo projeto
      const newProject = await projectsService.addProject(formData, userId)
      projects.value.push(newProject)
    }
    
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar projeto:', error)
    alert('Ocorreu um erro ao salvar o projeto. Tente novamente.')
  } finally {
    formLoading.value = false
  }
}

const deleteProject = async () => {
  if (!projectToDelete.value) return
  
  formLoading.value = true
  
  try {
    await projectsService.deleteProject(projectToDelete.value.id)
    
    // Remover da lista local
    projects.value = projects.value.filter(project => project.id !== projectToDelete.value.id)
    
    showDeleteModal.value = false
    projectToDelete.value = null
  } catch (error) {
    console.error('Erro ao excluir projeto:', error)
    alert('Ocorreu um erro ao excluir o projeto. Tente novamente.')
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.projects {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>