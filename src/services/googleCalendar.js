// Serviço de integração com Google Calendar

// Configurações da API do Google Calendar
const GOOGLE_API_CONFIG = {
  apiKey: '', // Será configurado pelo usuário
  clientId: '', // Será configurado pelo usuário
  discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  scopes: 'https://www.googleapis.com/auth/calendar.readonly'
}

// Estado da autenticação
let gapi = null
let isInitialized = false
let isSignedIn = false

// Função para carregar a API do Google
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve(window.gapi)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        resolve(window.gapi)
      })
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Função para inicializar a API do Google
const initializeGoogleAPI = async (apiKey, clientId) => {
  try {
    // Validação mais rigorosa dos parâmetros
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API Key é obrigatória e não pode estar vazia')
    }
    
    if (!clientId || clientId.trim() === '') {
      throw new Error('Client ID é obrigatório e não pode estar vazio')
    }

    // Verificar se os valores não são 'undefined' ou 'null' como string
    if (apiKey === 'undefined' || apiKey === 'null') {
      throw new Error('API Key inválida. Verifique se você copiou corretamente do Google Cloud Console.')
    }
    
    if (clientId === 'undefined' || clientId === 'null') {
      throw new Error('Client ID inválido. Verifique se você copiou corretamente do Google Cloud Console.')
    }

    console.log('Inicializando Google API com:', { apiKey: apiKey.substring(0, 10) + '...', clientId: clientId.substring(0, 20) + '...' })
    
    gapi = await loadGoogleAPI()
    
    await gapi.client.init({
      apiKey: apiKey.trim(),
      clientId: clientId.trim(),
      discoveryDocs: [GOOGLE_API_CONFIG.discoveryDoc],
      scope: GOOGLE_API_CONFIG.scopes
    })

    isInitialized = true
    isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get()
    
    console.log('Google Calendar API inicializada com sucesso')
    return true
  } catch (error) {
    console.error('Erro ao inicializar Google Calendar API:', error)
    
    // Tratar erros específicos da Google API
    if (error.message && error.message.includes('idpiframe_initialization_failed')) {
      throw new Error('Erro de inicialização: Verifique se o Client ID está correto e se o domínio está autorizado no Google Cloud Console. Certifique-se de que http://localhost:5173 está nas "Origens JavaScript autorizadas".')
    }
    
    if (error.message && error.message.includes('invalid_client')) {
      throw new Error('Client ID inválido. Verifique se você copiou o Client ID completo do Google Cloud Console.')
    }
    
    if (error.message && error.message.includes('API key')) {
      throw new Error('API Key inválida. Verifique se a API Key está correta e se a Google Calendar API está habilitada no seu projeto.')
    }
    
    // Erro genérico com mais informações
    throw new Error(`Erro ao configurar Google Calendar API: ${error.message || 'Erro desconhecido'}. Verifique suas credenciais e configurações no Google Cloud Console.`)
  }
}

// Função para fazer login no Google
const signIn = async () => {
  try {
    if (!isInitialized) {
      throw new Error('API não inicializada. Chame initializeGoogleAPI primeiro.')
    }

    const authInstance = gapi.auth2.getAuthInstance()
    await authInstance.signIn()
    isSignedIn = true
    
    console.log('Login realizado com sucesso')
    return true
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    throw error
  }
}

// Função para fazer logout do Google
const signOut = async () => {
  try {
    if (!isInitialized) {
      return
    }

    const authInstance = gapi.auth2.getAuthInstance()
    await authInstance.signOut()
    isSignedIn = false
    
    console.log('Logout realizado com sucesso')
    return true
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    throw error
  }
}

// Função para obter eventos do calendário
const getCalendarEvents = async (startDate, endDate, calendarId = 'primary') => {
  try {
    if (!isInitialized || !isSignedIn) {
      throw new Error('Usuário não autenticado')
    }

    const response = await gapi.client.calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime'
    })

    return response.result.items || []
  } catch (error) {
    console.error('Erro ao obter eventos do calendário:', error)
    throw error
  }
}

// Função para obter lista de calendários
const getCalendarList = async () => {
  try {
    if (!isInitialized || !isSignedIn) {
      throw new Error('Usuário não autenticado')
    }

    const response = await gapi.client.calendar.calendarList.list()
    return response.result.items || []
  } catch (error) {
    console.error('Erro ao obter lista de calendários:', error)
    throw error
  }
}

// Função para converter evento do Google Calendar em registro de horas
const convertEventToTimeEntry = (event, clientId = null, projectId = null) => {
  try {
    // Verificar se o evento tem horário de início e fim
    if (!event.start || !event.end) {
      return null
    }

    // Calcular duração em horas
    const startTime = new Date(event.start.dateTime || event.start.date)
    const endTime = new Date(event.end.dateTime || event.end.date)
    const durationMs = endTime.getTime() - startTime.getTime()
    const hours = durationMs / (1000 * 60 * 60) // Converter para horas

    // Eventos de dia inteiro são ignorados por padrão
    if (event.start.date && event.end.date) {
      return null
    }

    return {
      id: `gcal_${event.id}`,
      date: startTime.toISOString().split('T')[0],
      hours: Math.round(hours * 100) / 100, // Arredondar para 2 casas decimais
      description: event.summary || 'Evento sem título',
      clientId: clientId,
      projectId: projectId,
      type: 'meeting', // Tipo padrão para eventos do calendário
      customType: null,
      source: 'google_calendar',
      originalEventId: event.id,
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
      location: event.location || null,
      attendees: event.attendees ? event.attendees.length : 0
    }
  } catch (error) {
    console.error('Erro ao converter evento:', error)
    return null
  }
}

// Função para sincronizar eventos do calendário
const syncCalendarEvents = async (startDate, endDate, options = {}) => {
  try {
    const {
      calendarIds = ['primary'],
      clientId = null,
      projectId = null,
      filterKeywords = [],
      excludeKeywords = []
    } = options

    let allEvents = []

    // Obter eventos de todos os calendários selecionados
    for (const calendarId of calendarIds) {
      const events = await getCalendarEvents(startDate, endDate, calendarId)
      allEvents = allEvents.concat(events)
    }

    // Filtrar eventos por palavras-chave se especificado
    if (filterKeywords.length > 0) {
      allEvents = allEvents.filter(event => {
        const title = (event.summary || '').toLowerCase()
        const description = (event.description || '').toLowerCase()
        return filterKeywords.some(keyword => 
          title.includes(keyword.toLowerCase()) || 
          description.includes(keyword.toLowerCase())
        )
      })
    }

    // Excluir eventos por palavras-chave se especificado
    if (excludeKeywords.length > 0) {
      allEvents = allEvents.filter(event => {
        const title = (event.summary || '').toLowerCase()
        const description = (event.description || '').toLowerCase()
        return !excludeKeywords.some(keyword => 
          title.includes(keyword.toLowerCase()) || 
          description.includes(keyword.toLowerCase())
        )
      })
    }

    // Converter eventos para registros de horas
    const timeEntries = allEvents
      .map(event => convertEventToTimeEntry(event, clientId, projectId))
      .filter(entry => entry !== null)

    return timeEntries
  } catch (error) {
    console.error('Erro ao sincronizar eventos do calendário:', error)
    throw error
  }
}

// Exportar serviço
export const googleCalendarService = {
  // Configuração e autenticação
  initialize: initializeGoogleAPI,
  signIn,
  signOut,
  
  // Estado
  isInitialized: () => isInitialized,
  isSignedIn: () => isSignedIn,
  
  // Dados do calendário
  getCalendarList,
  getCalendarEvents,
  
  // Sincronização
  syncCalendarEvents,
  convertEventToTimeEntry,
  
  // Utilitários
  getCurrentUser: () => {
    if (!isInitialized || !isSignedIn) return null
    return gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()
  }
}

export default googleCalendarService