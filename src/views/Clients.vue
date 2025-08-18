<template>
  <div class="clients">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Clientes</h1>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="bi bi-plus-circle me-2"></i> Novo Cliente
      </button>
    </div>
    
    <!-- Lista de clientes -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        
        <div v-else-if="clients.length === 0" class="text-center py-5">
          <p class="text-muted mb-3">Nenhum cliente cadastrado.</p>
          <button class="btn btn-primary" @click="showAddModal = true">
            Adicionar Cliente
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Contato</th>
                  <th>Projetos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="client in clients" :key="client.id">
                  <td>{{ client.name }}</td>
                  <td>{{ formatCNPJ(client.cnpj) }}</td>
                  <td>{{ client.contactEmail }}</td>
                  <td>
                    <span class="badge bg-primary rounded-pill">
                      {{ getClientProjectsCount(client.id) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" @click="editClient(client)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="confirmDelete(client)"
                        :disabled="hasProjects(client.id)"
                        :title="hasProjects(client.id) ? 'Cliente possui projetos vinculados' : 'Excluir cliente'"
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
    
    <!-- Modal para adicionar/editar cliente -->
    <div class="modal fade" :class="{ 'show d-block': showAddModal }" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Cliente' : 'Novo Cliente' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveClient">
              <div class="mb-3">
                <label for="client-name" class="form-label">Nome da Empresa</label>
                <input 
                  type="text" 
                  id="client-name" 
                  v-model="clientForm.name" 
                  class="form-control" 
                  required
                />
              </div>
              
              <div class="mb-3">
                <label for="client-cnpj" class="form-label">CNPJ</label>
                <input 
                  type="text" 
                  id="client-cnpj" 
                  v-model="clientForm.cnpj" 
                  class="form-control" 
                  placeholder="00.000.000/0000-00"
                  maxlength="18"
                  @input="formatCNPJInput"
                />
              </div>
              
              <div class="mb-3">
                <label for="client-contact-name" class="form-label">Nome do Contato</label>
                <input 
                  type="text" 
                  id="client-contact-name" 
                  v-model="clientForm.contactName" 
                  class="form-control"
                />
              </div>
              
              <div class="mb-3">
                <label for="client-contact-email" class="form-label">Email do Contato</label>
                <input 
                  type="email" 
                  id="client-contact-email" 
                  v-model="clientForm.contactEmail" 
                  class="form-control"
                />
              </div>
              
              <div class="mb-3">
                <label for="client-contact-phone" class="form-label">Telefone do Contato</label>
                <input 
                  type="tel" 
                  id="client-contact-phone" 
                  v-model="clientForm.contactPhone" 
                  class="form-control"
                  placeholder="(00) 00000-0000"
                  maxlength="15"
                  @input="formatPhoneInput"
                />
              </div>
              
              <div class="mb-3">
                <label for="client-notes" class="form-label">Observações</label>
                <textarea 
                  id="client-notes" 
                  v-model="clientForm.notes" 
                  class="form-control" 
                  rows="3"
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
            <p>Tem certeza que deseja excluir o cliente <strong>{{ clientToDelete?.name }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
            <button type="button" class="btn btn-danger" @click="deleteClient" :disabled="formLoading">
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
import { clientsService } from '../services/clients'
import { projectsService } from '../services/projects'

const userStore = useUserStore()

// Estado
const loading = ref(true)
const formLoading = ref(false)
const clients = ref([])
const projects = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentClientId = ref(null)
const clientToDelete = ref(null)

// Formulário
const resetForm = () => {
  return {
    name: '',
    cnpj: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: ''
  }
}

const clientForm = ref(resetForm())

// Computed properties
const getClientProjectsCount = (clientId) => {
  return projects.value.filter(project => project.clientId === clientId).length
}

const hasProjects = (clientId) => {
  return getClientProjectsCount(clientId) > 0
}

// Métodos
const loadData = async () => {
  loading.value = true
  
  try {
    const userId = userStore.userId
    
    // Carregar clientes e projetos
    const [clientsData, projectsData] = await Promise.all([
      clientsService.getClients(userId),
      projectsService.getProjects(userId)
    ])
    
    clients.value = clientsData
    projects.value = projectsData
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
}

const formatCNPJ = (cnpj) => {
  if (!cnpj) return ''
  
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '')
  
  // Formata o CNPJ: 00.000.000/0000-00
  if (numbers.length === 14) {
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }
  
  return cnpj
}

const formatCNPJInput = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  
  if (value.length > 14) {
    value = value.substring(0, 14)
  }
  
  if (value.length >= 2) {
    value = value.substring(0, 2) + '.' + value.substring(2)
  }
  
  if (value.length >= 6) {
    value = value.substring(0, 6) + '.' + value.substring(6)
  }
  
  if (value.length >= 10) {
    value = value.substring(0, 10) + '/' + value.substring(10)
  }
  
  if (value.length >= 15) {
    value = value.substring(0, 15) + '-' + value.substring(15)
  }
  
  clientForm.value.cnpj = value
}

const formatPhoneInput = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  
  if (value.length > 11) {
    value = value.substring(0, 11)
  }
  
  if (value.length >= 2) {
    value = '(' + value.substring(0, 2) + ') ' + value.substring(2)
  }
  
  if (value.length >= 9) {
    value = value.substring(0, 9) + '-' + value.substring(9)
  }
  
  clientForm.value.contactPhone = value
}

const closeModal = () => {
  showAddModal.value = false
  isEditing.value = false
  currentClientId.value = null
  clientForm.value = resetForm()
}

const editClient = (client) => {
  isEditing.value = true
  currentClientId.value = client.id
  
  clientForm.value = {
    name: client.name,
    cnpj: client.cnpj || '',
    contactName: client.contactName || '',
    contactEmail: client.contactEmail || '',
    contactPhone: client.contactPhone || '',
    notes: client.notes || ''
  }
  
  showAddModal.value = true
}

const confirmDelete = (client) => {
  if (hasProjects(client.id)) return
  
  clientToDelete.value = client
  showDeleteModal.value = true
}

const saveClient = async () => {
  formLoading.value = true
  
  try {
    const userId = userStore.userId
    const formData = { ...clientForm.value }
    
    if (isEditing.value && currentClientId.value) {
      // Atualizar cliente existente
      await clientsService.updateClient(currentClientId.value, formData)
      
      // Atualizar na lista local
      const index = clients.value.findIndex(client => client.id === currentClientId.value)
      if (index !== -1) {
        clients.value[index] = { id: currentClientId.value, ...formData }
      }
    } else {
      // Adicionar novo cliente
      const newClient = await clientsService.addClient(formData, userId)
      clients.value.push(newClient)
    }
    
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
    alert('Ocorreu um erro ao salvar o cliente. Tente novamente.')
  } finally {
    formLoading.value = false
  }
}

const deleteClient = async () => {
  if (!clientToDelete.value) return
  
  formLoading.value = true
  
  try {
    await clientsService.deleteClient(clientToDelete.value.id)
    
    // Remover da lista local
    clients.value = clients.value.filter(client => client.id !== clientToDelete.value.id)
    
    showDeleteModal.value = false
    clientToDelete.value = null
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    alert('Ocorreu um erro ao excluir o cliente. Tente novamente.')
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

.clients {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>