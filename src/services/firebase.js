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
  getDoc,
  limit,
  startAfter,
  endBefore,
  limitToLast
} from 'firebase/firestore'
import { db, analytics } from '../main.js'

// Cache para otimizar consultas com TTL personalizado
const queryCache = new Map()
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função auxiliar para gerar chave de cache
const generateCacheKey = (collection, userId, filters = {}) => {
  return `${collection}_${userId}_${JSON.stringify(filters)}`
}

// Função auxiliar para verificar cache
const getCachedData = (cacheKey) => {
  const cached = queryCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  queryCache.delete(cacheKey)
  return null
}

// Função auxiliar para armazenar no cache
const setCachedData = (cacheKey, data, ttl = DEFAULT_CACHE_DURATION) => {
  queryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

// Limpar cache periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp >= value.ttl) {
      queryCache.delete(key)
    }
  }
}, 60000) // Limpar a cada minuto

// Função auxiliar para invalidar cache
const invalidateCache = (pattern) => {
  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key)
    }
  }
}

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

// Serviço para atividades
export const projectsService = {
  // Adicionar uma nova atividade
  async addProject(project, userId) {
    try {
      const projectData = {
        ...project,
        userId,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'projects'), projectData)
      
      // Registra evento de criação de atividade
      safeLogEvent(analytics, 'create_item', {
        content_type: 'project',
        item_id: docRef.id
      })
      
      return { id: docRef.id, ...projectData }
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error)
      throw error
    }
  },

  // Buscar atividades do usuário com cache otimizado
  async getProjects(userId) {
    try {
      const cacheKey = generateCacheKey('projects', userId)
      const cachedData = getCachedData(cacheKey)
      
      if (cachedData) {
        return cachedData
      }
      
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
      
      // Cache atividades por 15 minutos (mudam menos frequentemente)
      setCachedData(cacheKey, projects, 15 * 60 * 1000)
      return projects
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
      throw error
    }
  },

  // Atualizar atividade
  async updateProject(projectId, updates) {
    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      // Invalidar cache de atividades
      invalidateCache('projects')
      
      safeLogEvent(analytics, 'update_item', {
        content_type: 'project',
        item_id: projectId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error)
      throw error
    }
  },

  // Deletar atividade
  async deleteProject(projectId) {
    try {
      await deleteDoc(doc(db, 'projects', projectId))
      
      // Invalidar cache de atividades
      invalidateCache('projects')
      
      safeLogEvent(analytics, 'delete_item', {
        content_type: 'project',
        item_id: projectId
      })
      
      return true
    } catch (error) {
      console.error('Erro ao deletar atividade:', error)
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
      
      // Invalidar cache de clientes
      invalidateCache('clients')
      
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
      const cacheKey = generateCacheKey('clients', userId)
      const cachedData = getCachedData(cacheKey)
      
      if (cachedData) {
        return cachedData
      }
      
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
      
      setCachedData(cacheKey, clients)
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
      
      // Invalidar cache de clientes
      invalidateCache('clients')
      
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
      
      // Invalidar cache de clientes
      invalidateCache('clients')
      
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
      
      // Invalidar cache de lançamentos
      invalidateCache('timeEntries')
      
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

  // Buscar lançamentos do usuário com paginação otimizada
  async getTimeEntries(userId, filters = {}) {
    try {
      const cacheKey = generateCacheKey('timeEntries', userId, filters)
      const cachedData = getCachedData(cacheKey)
      
      if (cachedData) {
        return cachedData
      }
      
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
      
      // Aplicar limite se especificado (para paginação)
      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }
      
      // Aplicar cursor para paginação
      if (filters.startAfterDoc) {
        q = query(q, startAfter(filters.startAfterDoc))
      }
      
      const querySnapshot = await getDocs(q)
      const timeEntries = []
      
      querySnapshot.forEach((doc) => {
        timeEntries.push({ id: doc.id, ...doc.data() })
      })
      
      // Cache apenas se não for uma consulta paginada
      if (!filters.limit && !filters.startAfterDoc) {
        setCachedData(cacheKey, timeEntries)
      }
      
      return {
        data: timeEntries,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === (filters.limit || timeEntries.length)
      }
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error)
      throw error
    }
  },

  // Buscar contagem total de registros de forma otimizada
  async getTimeEntriesCount(userId, filters = {}) {
    try {
      const cacheKey = generateCacheKey('timeEntriesCount', userId, filters)
      const cachedData = getCachedData(cacheKey)
      
      if (cachedData !== null) {
        return cachedData
      }
      
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
      
      const querySnapshot = await getDocs(q)
      const count = querySnapshot.size
      
      // Cache por 5 minutos
      setCachedData(cacheKey, count, 5 * 60 * 1000)
      return count
    } catch (error) {
      console.error('Erro ao buscar contagem de lançamentos:', error)
      throw error
    }
  },

  // Buscar lançamentos por período (para relatórios)
  async getTimeEntriesByPeriod(userId, startDate, endDate) {
    try {
      // Converter datas para Timestamp do Firestore se necessário
      const start = startDate instanceof Date ? startDate : new Date(startDate)
      const end = endDate instanceof Date ? endDate : new Date(endDate)
      
      const filters = { startDate: start, endDate: end }
      const cacheKey = generateCacheKey('timeEntriesByPeriod', userId, filters)
      const cachedData = getCachedData(cacheKey)
      
      if (cachedData) {
        return cachedData
      }
      
      const q = query(
        collection(db, 'timeEntries'),
        where('userId', '==', userId),
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const timeEntries = []
      
      querySnapshot.forEach((doc) => {
        timeEntries.push({ id: doc.id, ...doc.data() })
      })
      
      setCachedData(cacheKey, timeEntries)
      return timeEntries
    } catch (error) {
      console.error('Erro ao buscar lançamentos por período:', error)
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
      
      // Invalidar cache de lançamentos
      invalidateCache('timeEntries')
      
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
      
      // Invalidar cache de lançamentos
      invalidateCache('timeEntries')
      
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