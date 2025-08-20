// Serviço Firebase Real - Substituindo localStorage por Firestore
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { db, analytics } from '../main.js'

// Função auxiliar para registrar eventos de analytics
const safeLogEvent = (analytics, eventName, eventParams) => {
  try {
    if (analytics) {
      analytics.logEvent(eventName, eventParams)
    }
  } catch (error) {
    console.error(`Erro ao registrar evento ${eventName}:`, error)
  }
}

// Serviço para projetos
export const projectsService = {
  // Adicionar um novo projeto
  async addProject(project, userId) {
    try {
      const projectData = {
        ...project,
        userId,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'projects'), projectData)
      
      // Registra evento de criação de projeto
      safeLogEvent(analytics, 'create_item', {
        content_type: 'project',
        item_id: docRef.id
      })
      
      return { id: docRef.id, ...projectData }
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error)
      throw error
    }
  },

  // Buscar projetos do usuário
  async getProjects(userId) {
    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const projects = []
      
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() })
      })
      
      return projects
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
      throw error
    }
  },

  // Atualizar projeto
  async updateProject(projectId, updates) {
    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      safeLogEvent(analytics, 'update_item', {
        content_type: 'project',
        item_id: projectId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      throw error
    }
  },

  // Deletar projeto
  async deleteProject(projectId) {
    try {
      await deleteDoc(doc(db, 'projects', projectId))
      
      safeLogEvent(analytics, 'delete_item', {
        content_type: 'project',
        item_id: projectId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
      throw error
    }
  }
}

// Serviço para clientes
export const clientsService = {
  // Adicionar um novo cliente
  async addClient(client, userId) {
    try {
      const clientData = {
        ...client,
        userId,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'clients'), clientData)
      
      safeLogEvent(analytics, 'create_item', {
        content_type: 'client',
        item_id: docRef.id
      })
      
      return { id: docRef.id, ...clientData }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      throw error
    }
  },

  // Buscar clientes do usuário
  async getClients(userId) {
    try {
      const q = query(
        collection(db, 'clients'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const clients = []
      
      querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() })
      })
      
      return clients
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      throw error
    }
  },

  // Atualizar cliente
  async updateClient(clientId, updates) {
    try {
      const clientRef = doc(db, 'clients', clientId)
      await updateDoc(clientRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      safeLogEvent(analytics, 'update_item', {
        content_type: 'client',
        item_id: clientId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }
  },

  // Deletar cliente
  async deleteClient(clientId) {
    try {
      await deleteDoc(doc(db, 'clients', clientId))
      
      safeLogEvent(analytics, 'delete_item', {
        content_type: 'client',
        item_id: clientId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      throw error
    }
  }
}

// Serviço para lançamentos de tempo
export const timeEntriesService = {
  // Adicionar um novo lançamento
  async addTimeEntry(timeEntry, userId) {
    try {
      const timeEntryData = {
        ...timeEntry,
        userId,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'timeEntries'), timeEntryData)
      
      safeLogEvent(analytics, 'create_item', {
        content_type: 'time_entry',
        item_id: docRef.id
      })
      
      return { id: docRef.id, ...timeEntryData }
    } catch (error) {
      console.error('Erro ao adicionar lançamento:', error)
      throw error
    }
  },

  // Buscar lançamentos do usuário
  async getTimeEntries(userId, filters = {}) {
    try {
      let q = query(
        collection(db, 'timeEntries'),
        where('userId', '==', userId)
      )
      
      // Adicionar filtros se fornecidos
      if (filters.projectId) {
        q = query(q, where('projectId', '==', filters.projectId))
      }
      
      if (filters.startDate && filters.endDate) {
        q = query(
          q,
          where('date', '>=', filters.startDate),
          where('date', '<=', filters.endDate)
        )
      }
      
      q = query(q, orderBy('date', 'desc'))
      
      const querySnapshot = await getDocs(q)
      const timeEntries = []
      
      querySnapshot.forEach((doc) => {
        timeEntries.push({ id: doc.id, ...doc.data() })
      })
      
      return timeEntries
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error)
      throw error
    }
  },

  // Atualizar lançamento
  async updateTimeEntry(timeEntryId, updates) {
    try {
      const timeEntryRef = doc(db, 'timeEntries', timeEntryId)
      await updateDoc(timeEntryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      safeLogEvent(analytics, 'update_item', {
        content_type: 'time_entry',
        item_id: timeEntryId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error)
      throw error
    }
  },

  // Deletar lançamento
  async deleteTimeEntry(timeEntryId) {
    try {
      await deleteDoc(doc(db, 'timeEntries', timeEntryId))
      
      safeLogEvent(analytics, 'delete_item', {
        content_type: 'time_entry',
        item_id: timeEntryId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao deletar lançamento:', error)
      throw error
    }
  }
}

// Exportar serverTimestamp para uso em outros componentes
export { serverTimestamp }

// Exportar analytics para uso em outros componentes
export { analytics }