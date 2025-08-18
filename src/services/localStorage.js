/**
 * Serviço de armazenamento local - Alternativa 100% gratuita ao Firebase
 * Utiliza localStorage para persistir dados localmente no navegador
 */

class LocalStorageService {
  constructor() {
    this.storageKeys = {
      clients: 'controle_horas_clients',
      projects: 'controle_horas_projects',
      timeEntries: 'controle_horas_time_entries',
      user: 'controle_horas_user'
    }
    
    // Inicializar dados se não existirem
    this.initializeData()
  }

  /**
   * Inicializa os dados no localStorage se não existirem
   */
  initializeData() {
    Object.values(this.storageKeys).forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]))
      }
    })
  }

  /**
   * Gera um ID único para novos registros
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * Obtém todos os registros de uma coleção
   */
  getCollection(collectionName) {
    try {
      const key = this.storageKeys[collectionName]
      if (!key) throw new Error(`Coleção '${collectionName}' não encontrada`)
      
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`Erro ao obter coleção ${collectionName}:`, error)
      return []
    }
  }

  /**
   * Salva uma coleção completa
   */
  setCollection(collectionName, data) {
    try {
      const key = this.storageKeys[collectionName]
      if (!key) throw new Error(`Coleção '${collectionName}' não encontrada`)
      
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Erro ao salvar coleção ${collectionName}:`, error)
      return false
    }
  }

  /**
   * Adiciona um novo documento à coleção
   */
  addDocument(collectionName, document) {
    try {
      const collection = this.getCollection(collectionName)
      const newDocument = {
        id: this.generateId(),
        ...document,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      collection.push(newDocument)
      this.setCollection(collectionName, collection)
      
      return newDocument
    } catch (error) {
      console.error(`Erro ao adicionar documento em ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Atualiza um documento existente
   */
  updateDocument(collectionName, id, updates) {
    try {
      const collection = this.getCollection(collectionName)
      const index = collection.findIndex(doc => doc.id === id)
      
      if (index === -1) {
        throw new Error(`Documento com ID '${id}' não encontrado`)
      }
      
      collection[index] = {
        ...collection[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      this.setCollection(collectionName, collection)
      return collection[index]
    } catch (error) {
      console.error(`Erro ao atualizar documento ${id} em ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Remove um documento
   */
  deleteDocument(collectionName, id) {
    try {
      const collection = this.getCollection(collectionName)
      const filteredCollection = collection.filter(doc => doc.id !== id)
      
      if (collection.length === filteredCollection.length) {
        throw new Error(`Documento com ID '${id}' não encontrado`)
      }
      
      this.setCollection(collectionName, filteredCollection)
      return true
    } catch (error) {
      console.error(`Erro ao deletar documento ${id} em ${collectionName}:`, error)
      throw error
    }
  }

  /**
   * Busca documentos por critério
   */
  queryDocuments(collectionName, filterFn) {
    try {
      const collection = this.getCollection(collectionName)
      return collection.filter(filterFn)
    } catch (error) {
      console.error(`Erro ao consultar documentos em ${collectionName}:`, error)
      return []
    }
  }

  /**
   * Obtém um documento por ID
   */
  getDocument(collectionName, id) {
    try {
      const collection = this.getCollection(collectionName)
      return collection.find(doc => doc.id === id) || null
    } catch (error) {
      console.error(`Erro ao obter documento ${id} em ${collectionName}:`, error)
      return null
    }
  }

  /**
   * Limpa todos os dados (útil para desenvolvimento)
   */
  clearAllData() {
    try {
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key)
      })
      this.initializeData()
      return true
    } catch (error) {
      console.error('Erro ao limpar dados:', error)
      return false
    }
  }

  /**
   * Exporta todos os dados para backup
   */
  exportData() {
    try {
      const data = {}
      Object.entries(this.storageKeys).forEach(([collection, key]) => {
        data[collection] = this.getCollection(collection)
      })
      return data
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      return null
    }
  }

  /**
   * Importa dados de backup
   */
  importData(data) {
    try {
      Object.entries(data).forEach(([collection, documents]) => {
        if (this.storageKeys[collection]) {
          this.setCollection(collection, documents)
        }
      })
      return true
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }
}

// Instância singleton
const localStorageService = new LocalStorageService()

export default localStorageService