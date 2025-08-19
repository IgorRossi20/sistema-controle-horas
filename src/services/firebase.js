// Serviço de dados local - Alternativa 100% gratuita ao Firebase
import localStorageService from './localStorage.js'

// Mock do analytics para manter compatibilidade
const mockAnalytics = {
  logEvent: (eventName, eventParams) => {
    console.log(`📊 Analytics Event: ${eventName}`, eventParams)
  }
}

// Função auxiliar para simular serverTimestamp
const serverTimestamp = () => new Date().toISOString()

// Função auxiliar para registrar eventos de analytics (mock)
const safeLogEvent = (analytics, eventName, eventParams) => {
  try {
    mockAnalytics.logEvent(eventName, eventParams)
  } catch (error) {
    console.error(`Erro ao registrar evento ${eventName}:`, error)
  }
}

// Função para simular delay de rede (opcional, para simular comportamento real)
const simulateNetworkDelay = () => {
  return new Promise(resolve => setTimeout(resolve, Math.random() * 100))
}


// Serviço para projetos
export const projectsService = {
  // Adicionar um novo projeto
  async addProject(project, userId) {
    try {
      await simulateNetworkDelay()
      
      const projectData = {
        ...project,
        userId,
        createdAt: serverTimestamp()
      }
      
      const newProject = localStorageService.addDocument('projects', projectData)
      
      // Registra evento de criação de projeto
      safeLogEvent(mockAnalytics, 'create_item', {
        content_type: 'project',
        item_id: newProject.id
      })
      
      return newProject
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error)
      throw error
    }
  },

  // Obter todos os projetos do usuário
  async getProjects(userId) {
    try {
      await simulateNetworkDelay()
      
      const projects = localStorageService.queryDocuments('projects', 
        project => project.userId === userId
      )
      
      // Ordenar por data de criação (mais recente primeiro)
      return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (error) {
      console.error('Erro ao obter projetos:', error)
      throw error
    }
  },



  // Obter um projeto específico
  async getProject(projectId) {
    try {
      await simulateNetworkDelay()
      
      const project = localStorageService.getDocument('projects', projectId)
      if (project) {
        return project
      } else {
        throw new Error('Projeto não encontrado')
      }
    } catch (error) {
      console.error('Erro ao obter projeto:', error)
      throw error
    }
  },

  // Atualizar um projeto
  async updateProject(projectId, projectData) {
    try {
      await simulateNetworkDelay()
      
      const updatedProject = localStorageService.updateDocument('projects', projectId, projectData)
      
      // Registra evento de atualização de projeto
      safeLogEvent(mockAnalytics, 'update_item', {
        content_type: 'project',
        item_id: projectId
      })
      
      return updatedProject
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      throw error
    }
  },

  // Excluir um projeto
  async deleteProject(projectId) {
    try {
      await simulateNetworkDelay()
      
      localStorageService.deleteDocument('projects', projectId)
      
      // Registra evento de exclusão de projeto
      safeLogEvent(mockAnalytics, 'delete_item', {
        content_type: 'project',
        item_id: projectId
      })
      
      return projectId
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)
      throw error
    }
  }
}

// Serviço para registros de tempo
export const timeEntriesService = {
  // Adicionar um novo registro de tempo
  async addTimeEntry(timeEntry, userId) {
    try {
      await simulateNetworkDelay()
      
      const timeEntryData = {
        ...timeEntry,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const newTimeEntry = localStorageService.addDocument('timeEntries', timeEntryData)
      
      // Registra evento de criação de registro de tempo
      safeLogEvent(mockAnalytics, 'create_item', {
        content_type: 'time_entry',
        item_id: newTimeEntry.id,
        project_id: timeEntry.projectId || 'none',
        duration_minutes: timeEntry.durationMinutes || 0
      })
      
      return newTimeEntry
    } catch (error) {
      console.error('Erro ao adicionar registro de tempo:', error)
      throw error
    }
  },

  // Obter todos os registros de tempo do usuário
  async getTimeEntries(userId) {
    try {
      await simulateNetworkDelay()
      
      const timeEntries = localStorageService.queryDocuments('timeEntries', 
        entry => entry.userId === userId
      )
      
      // Ordenar por data (mais recente primeiro)
      return timeEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
    } catch (error) {
      console.error('Erro ao obter registros de tempo:', error)
      throw error
    }
  },

  // Obter registros de tempo por período
  async getTimeEntriesByPeriod(userId, startDate, endDate) {
    try {
      await simulateNetworkDelay()
      
      const timeEntries = localStorageService.queryDocuments('timeEntries', 
        entry => {
          if (entry.userId !== userId) return false
          
          // Converter a data do entry para Date se necessário
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
          
          // Verificar se a data é válida
          if (isNaN(entryDate.getTime())) return false
          
          // Comparar apenas as datas (sem horário)
          const entryDateOnly = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
          const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
          
          return entryDateOnly >= startDateOnly && entryDateOnly <= endDateOnly
        }
      )
      
      // Ordenar por data (mais recente primeiro)
      return timeEntries.sort((a, b) => {
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
    } catch (error) {
      console.error('Erro ao obter registros de tempo por período:', error)
      throw error
    }
  },

  // Obter registros de tempo por projeto
  async getTimeEntriesByProject(userId, projectId) {
    try {
      await simulateNetworkDelay()
      
      const timeEntries = localStorageService.queryDocuments('timeEntries', 
        entry => entry.userId === userId && entry.projectId === projectId
      )
      
      // Ordenar por data (mais recente primeiro)
      return timeEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
    } catch (error) {
      console.error('Erro ao obter registros de tempo por projeto:', error)
      throw error
    }
  },



  // Obter um registro de tempo específico
  async getTimeEntry(timeEntryId) {
    try {
      await simulateNetworkDelay()
      
      const timeEntry = localStorageService.getDocument('timeEntries', timeEntryId)
      if (timeEntry) {
        return timeEntry
      } else {
        throw new Error('Registro de tempo não encontrado')
      }
    } catch (error) {
      console.error('Erro ao obter registro de tempo:', error)
      throw error
    }
  },

  // Atualizar um registro de tempo
  async updateTimeEntry(timeEntryId, timeEntryData) {
    try {
      await simulateNetworkDelay()
      
      const updatedData = {
        ...timeEntryData,
        updatedAt: serverTimestamp()
      }
      
      const updatedTimeEntry = localStorageService.updateDocument('timeEntries', timeEntryId, updatedData)
      
      // Registra evento de atualização de registro de tempo
      safeLogEvent(mockAnalytics, 'update_item', {
        content_type: 'time_entry',
        item_id: timeEntryId,
        project_id: timeEntryData.projectId || 'none',
        duration_minutes: timeEntryData.durationMinutes || 0
      })
      
      return updatedTimeEntry
    } catch (error) {
      console.error('Erro ao atualizar registro de tempo:', error)
      throw error
    }
  },

  // Excluir um registro de tempo
  async deleteTimeEntry(timeEntryId) {
    try {
      await simulateNetworkDelay()
      
      localStorageService.deleteDocument('timeEntries', timeEntryId)
      
      // Registra evento de exclusão de registro de tempo
      safeLogEvent(mockAnalytics, 'delete_item', {
        content_type: 'time_entry',
        item_id: timeEntryId
      })
      
      return timeEntryId
    } catch (error) {
      console.error('Erro ao excluir registro de tempo:', error)
      throw error
    }
  }
}