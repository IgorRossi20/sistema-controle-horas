<template>
  <div class="projects">
    <div class="page-header mb-5">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Projetos</h1>
          <p class="page-subtitle">Gerencie seus projetos e clientes</p>
        </div>
        <button class="btn btn-primary btn-modern hover-lift transition-all" @click="showAddModal = true">
          <i class="bi bi-plus-circle me-2"></i> Novo Projeto
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
    <div class="card modern-card animate-fade-in hover-lift transition-all">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else-if="(!filteredProjects || filteredProjects.length === 0)" class="text-center py-5">
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
                  <th>Status</th>
                  <th>Horas Registradas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in filteredProjects" :key="project.id">
                  <td>{{ project.name }}</td>
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
                      <button class="btn btn-sm btn-outline-primary transition-all hover-scale" @click="editProject(project)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger transition-all hover-scale" 
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
        <div class="modal-content modern-modal">
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
            <button type="button" class="btn btn-secondary transition-all hover-scale" @click="showDeleteModal = false">Cancelar</button>
            <button type="button" class="btn btn-danger transition-all hover-scale" @click="deleteProject" :disabled="formLoading">
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
import { timeEntriesService } from '../services/timeEntries'
import { formatHoursToText } from '../utils/formatHours'

const userStore = useUserStore()

// Estado
const loading = ref(true)
const formLoading = ref(false)
const projects = ref([])
const timeEntries = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentProjectId = ref(null)
const projectToDelete = ref(null)

// Filtros
const statusFilter = ref('')

// Formulário
const resetForm = () => {
  return {
    name: '',
    status: 'active',
    description: '',
    hourlyRate: ''
  }
}

const projectForm = ref(resetForm())

// Computed properties
const filteredProjects = computed(() => {
  let result = [...projects.value]
  
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
  
  return formatHoursToText(totalHours)
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

/* Status Badges */
.badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.bg-success {
  background: linear-gradient(135deg, #28a745, #20c997) !important;
}

.bg-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14) !important;
}

.bg-secondary {
  background: linear-gradient(135deg, #6c757d, #495057) !important;
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

/* Modal Backdrop */
.modal {
  background-color: rgba(30, 58, 95, 0.4);
  backdrop-filter: blur(8px);
}

/* Animation */
.projects {
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
  
  /* Filter controls */
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
  
  /* Project cards */
  .modern-card {
    margin-bottom: 1rem;
    padding: 1rem;
  }
  
  .card-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .card-header h5 {
    font-size: 1rem;
    margin-bottom: 0;
  }
  
  .card-header .badge {
    align-self: flex-start;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-body p {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  /* Project stats */
  .row .col-6 {
    margin-bottom: 0.5rem;
  }
  
  .text-muted {
    font-size: 0.75rem;
  }
  
  .fw-bold {
    font-size: 0.875rem;
  }
  
  /* Action buttons */
  .btn-group {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-group .btn {
    width: 100%;
    margin: 0;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
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
  
  .btn-modern {
    width: auto;
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
  
  /* Project cards in landscape */
  .modern-card {
    margin-bottom: 1rem;
  }
  
  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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
  
  /* Project cards grid for tablets */
  .row .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 1rem;
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
  
  /* Table improvements */
  .table-responsive {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Project grid */
  .row .col-md-6,
  .row .col-lg-4 {
    margin-bottom: 1rem;
  }
  
  /* Status badges */
  .badge {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
  
  /* Pagination adjustments */
  .pagination {
    justify-content: center;
  }
  
  .pagination .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
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
  
  .btn-group .btn:hover {
    transform: none;
  }
  
  /* Larger touch targets */
  .table .btn {
    min-width: 44px;
    min-height: 44px;
  }
  
  .card-header .btn {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Print optimizations */
@media print {
  .page-header,
  .btn,
  .btn-group {
    display: none !important;
  }
  
  .modern-card {
    break-inside: avoid;
    margin-bottom: 1rem;
    box-shadow: none;
    border: 1px solid #ddd;
  }
  
  .table-responsive {
    margin: 0;
    padding: 0;
  }
}
</style>