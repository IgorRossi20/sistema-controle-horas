/**
 * Serviço para calcular dias úteis e gerenciar metas de horas mensais
 * Implementa memoização para otimizar performance
 */

// Cache para memoização
const memoCache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas

/**
 * Função de memoização genérica
 * @param {Function} fn - Função a ser memoizada
 * @param {string} keyPrefix - Prefixo para a chave do cache
 * @returns {Function} - Função memoizada
 */
function memoize(fn, keyPrefix) {
  return function(...args) {
    const key = `${keyPrefix}_${JSON.stringify(args)}`
    const cached = memoCache.get(key)
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.value
    }
    
    const result = fn.apply(this, args)
    memoCache.set(key, {
      value: result,
      timestamp: Date.now()
    })
    
    // Limpar cache antigo periodicamente
    if (memoCache.size > 100) {
      const now = Date.now()
      for (const [cacheKey, cacheValue] of memoCache.entries()) {
        if (now - cacheValue.timestamp > CACHE_TTL) {
          memoCache.delete(cacheKey)
        }
      }
    }
    
    return result
  }
}

// Feriados nacionais brasileiros fixos
const FIXED_HOLIDAYS = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalhador',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Dia da Consciência Negra',
  '12-25': 'Natal'
}

/**
 * Calcula a Páscoa para um determinado ano (com memoização)
 * @param {number} year - Ano
 * @returns {Date} - Data da Páscoa
 */
const calculateEaster = memoize(function(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  
  return new Date(year, month - 1, day)
}, 'easter')

/**
 * Obtém todos os feriados para um determinado ano (com memoização)
 * @param {number} year - Ano
 * @returns {Date[]} - Array de datas dos feriados
 */
const getHolidays = memoize(function(year) {
  const holidays = []
  
  // Feriados fixos
  Object.keys(FIXED_HOLIDAYS).forEach(dateStr => {
    const [month, day] = dateStr.split('-').map(Number)
    holidays.push(new Date(year, month - 1, day))
  })
  
  // Feriados móveis baseados na Páscoa
  const easter = calculateEaster(year)
  
  // Carnaval (47 dias antes da Páscoa)
  const carnival = new Date(easter)
  carnival.setDate(easter.getDate() - 47)
  holidays.push(carnival)
  
  // Sexta-feira Santa (2 dias antes da Páscoa)
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  holidays.push(goodFriday)
  
  // Corpus Christi (60 dias após a Páscoa)
  const corpusChristi = new Date(easter)
  corpusChristi.setDate(easter.getDate() + 60)
  holidays.push(corpusChristi)
  
  return holidays
}, 'holidays')

/**
 * Verifica se uma data é feriado
 * @param {Date} date - Data a verificar
 * @returns {boolean} - True se for feriado
 */
function isHoliday(date) {
  const holidays = getHolidays(date.getFullYear())
  return holidays.some(holiday => 
    holiday.getDate() === date.getDate() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getFullYear() === date.getFullYear()
  )
}

/**
 * Verifica se uma data é fim de semana
 * @param {Date} date - Data a verificar
 * @returns {boolean} - True se for fim de semana
 */
function isWeekend(date) {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Domingo ou Sábado
}

/**
 * Verifica se uma data é dia útil - com memoização
 * @param {Date} date - Data a verificar
 * @returns {boolean} - True se for dia útil
 */
const isWorkingDay = memoize(function(date) {
  return !isWeekend(date) && !isHoliday(date)
}, 'workingDay')

/**
 * Calcula o número de dias úteis em um mês - com memoização
 * @param {number} year - Ano
 * @param {number} month - Mês (0-11)
 * @returns {number} - Número de dias úteis
 */
const getWorkingDaysInMonth = memoize(function(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let workingDays = 0
  
  for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
    if (isWorkingDay(date)) {
      workingDays++
    }
  }
  
  return workingDays
}, 'workingDaysMonth')

/**
 * Calcula o número de dias úteis restantes no mês - com memoização
 * @param {Date} currentDate - Data atual
 * @returns {number} - Número de dias úteis restantes
 */
const getRemainingWorkingDays = memoize(function(currentDate = new Date()) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const lastDay = new Date(year, month + 1, 0)
  let remainingDays = 0
  
  for (let date = new Date(currentDate); date <= lastDay; date.setDate(date.getDate() + 1)) {
    if (isWorkingDay(date)) {
      remainingDays++
    }
  }
  
  return remainingDays
}, 'remainingWorkingDays')

/**
 * Calcula o número de dias úteis trabalhados no mês até a data atual - com memoização
 * @param {Date} currentDate - Data atual
 * @returns {number} - Número de dias úteis trabalhados
 */
const getWorkedDaysInMonth = memoize(function(currentDate = new Date()) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  let workedDays = 0
  
  for (let date = new Date(firstDay); date < currentDate; date.setDate(date.getDate() + 1)) {
    if (isWorkingDay(date)) {
      workedDays++
    }
  }
  
  return workedDays
}, 'workedDaysMonth')

/**
 * Calcula o número de dias trabalhados no mês atual (com registros de horas)
 * @param {Array} timeEntries - Array de registros de tempo do mês
 * @param {Date} currentDate - Data atual
 * @returns {number} - Número de dias trabalhados
 */
function getActualWorkedDaysInMonth(timeEntries, currentDate = new Date()) {
  if (!timeEntries || !Array.isArray(timeEntries) || timeEntries.length === 0) {
    return 0
  }
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Obter datas únicas dos registros de tempo no mês atual
  const workedDates = new Set()
  
  timeEntries.forEach(entry => {
    try {
      let entryDate
      if (entry.date instanceof Date) {
        entryDate = entry.date
      } else if (typeof entry.date === 'string') {
        entryDate = new Date(entry.date)
      } else if (entry.date && typeof entry.date === 'object' && entry.date.seconds) {
        entryDate = new Date(entry.date.seconds * 1000)
      } else {
        entryDate = new Date(entry.date)
      }
      
      // Verificar se a data é válida e do mês atual
      if (!isNaN(entryDate.getTime()) && 
          entryDate.getFullYear() === year && 
          entryDate.getMonth() === month) {
        const dateKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`
        workedDates.add(dateKey)
      }
    } catch (error) {
      console.warn('Erro ao processar data do registro:', entry, error)
    }
  })
  
  return workedDates.size
}

/**
 * Calcula o número de dias restantes no mês atual
 * @param {Date} currentDate - Data atual
 * @returns {number} - Número de dias restantes no mês
 */
function getRemainingDaysInMonth(currentDate = new Date()) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const currentDay = currentDate.getDate()
  
  return Math.max(0, lastDay - currentDay)
}

/**
 * Calcula estatísticas de progresso mensal para a faixa de 180-200 horas
 * @param {number} hoursWorked - Horas já trabalhadas no mês
 * @param {Date} currentDate - Data atual
 * @param {Array} timeEntries - Array de registros de tempo do mês (opcional)
 * @returns {Object} - Estatísticas de progresso
 */
function getMonthlyProgress(hoursWorked, currentDate = new Date(), timeEntries = []) {
  const MONTHLY_MIN = 180
  const MONTHLY_TARGET = 200
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Verificar se é dia 1º do mês para reset
  const isFirstDayOfMonth = currentDate.getDate() === 1
  
  // Se for dia 1º, as horas restantes devem ser resetadas para a meta completa
  const effectiveHoursWorked = isFirstDayOfMonth ? 0 : hoursWorked
  
  const totalWorkingDays = getWorkingDaysInMonth(year, month)
  const workedDaysUteis = getWorkedDaysInMonth(currentDate)
  const remainingWorkingDays = getRemainingWorkingDays(currentDate)
  
  // Dias trabalhados reais (com registros) e dias restantes do mês
  const actualWorkedDays = getActualWorkedDaysInMonth(timeEntries, currentDate)
  const remainingDaysInMonth = getRemainingDaysInMonth(currentDate)
  
  // Calcular progresso baseado na faixa 180-200
  const progressPercentage = (effectiveHoursWorked / MONTHLY_TARGET) * 100
  const minProgressPercentage = (effectiveHoursWorked / MONTHLY_MIN) * 100
  
  // Calcular horas restantes baseado no contexto atual
  let targetHours = MONTHLY_TARGET
  if (effectiveHoursWorked < MONTHLY_MIN) {
    // Se ainda não atingiu o mínimo, foca em atingir 180h
    targetHours = MONTHLY_MIN
  } else if (effectiveHoursWorked >= MONTHLY_MIN && effectiveHoursWorked < MONTHLY_TARGET) {
    // Se já atingiu o mínimo, pode mirar nas 200h sem pressão
    targetHours = MONTHLY_TARGET
  } else {
    // Se já passou de 200h, não precisa trabalhar mais
    targetHours = effectiveHoursWorked
  }
  
  // Horas restantes sempre baseadas na meta (reset no dia 1º)
  const remainingHours = isFirstDayOfMonth ? MONTHLY_MIN : Math.max(0, targetHours - effectiveHoursWorked)
  
  // Dias úteis fixos por mês
  const fixedWorkingDaysByMonth = {
    0: 22,  // Janeiro
    1: 20,  // Fevereiro
    2: 23,  // Março
    3: 22,  // Abril
    4: 22,  // Maio
    5: 21,  // Junho
    6: 23,  // Julho
    7: 21,  // Agosto
    8: 22,  // Setembro
    9: 23,  // Outubro
    10: 21, // Novembro
    11: 21  // Dezembro
  }
  
  // Calcular média necessária por dia útil restante para atingir a meta
  const remainingWorkingDaysInMonth = getRemainingWorkingDays(currentDate)
  let averageHoursPerWorkingDay = 0
  
  // Ajuste solicitado: calcular necessário/dia útil sempre com base nas 200 horas
  const remainingHoursForTarget200 = Math.max(0, MONTHLY_TARGET - effectiveHoursWorked)
  if (remainingWorkingDaysInMonth > 0 && remainingHoursForTarget200 > 0) {
    averageHoursPerWorkingDay = remainingHoursForTarget200 / remainingWorkingDaysInMonth
  } else {
    averageHoursPerWorkingDay = 0
  }
  
  // Expectativa baseada no mínimo de 180h
  const expectedMinHours = (workedDaysUteis / totalWorkingDays) * MONTHLY_MIN
  const expectedTargetHours = (workedDaysUteis / totalWorkingDays) * MONTHLY_TARGET
  const isOnTrack = effectiveHoursWorked >= expectedMinHours
  
  return {
    monthlyMin: MONTHLY_MIN,
    monthlyTarget: MONTHLY_TARGET,
    targetHours,
    hoursWorked: effectiveHoursWorked,
    remainingHours: Math.round(remainingHours * 100) / 100,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    minProgressPercentage: Math.round(minProgressPercentage * 100) / 100,
    totalWorkingDays,
    workedDays: actualWorkedDays, // Dias realmente trabalhados (com registros)
    remainingDays: remainingDaysInMonth, // Dias restantes do mês
    remainingWorkingDays: remainingWorkingDaysInMonth, // Dias úteis restantes (exclui feriados e fins de semana)
    averageHoursPerDay: Math.round(averageHoursPerWorkingDay * 100) / 100, // Horas necessárias por dia útil restante
    expectedMinHours: Math.round(expectedMinHours * 100) / 100,
    expectedTargetHours: Math.round(expectedTargetHours * 100) / 100,
    isOnTrack,
    isFirstDayReset: isFirstDayOfMonth, // Indica se houve reset no dia 1º
    status: getProgressStatus(effectiveHoursWorked, MONTHLY_MIN, MONTHLY_TARGET, isOnTrack)
  }
}

/**
 * Determina o status do progresso baseado na faixa de 180-200 horas
 * @param {number} hoursWorked - Horas trabalhadas
 * @param {number} monthlyMin - Meta mínima (180h)
 * @param {number} monthlyTarget - Meta ideal (200h)
 * @param {boolean} isOnTrack - Se está no caminho certo para o mínimo
 * @returns {string} - Status do progresso
 */
function getProgressStatus(hoursWorked, monthlyMin, monthlyTarget, isOnTrack) {
  if (hoursWorked > monthlyTarget) return 'exceeded' // Passou de 200h
  if (hoursWorked >= monthlyTarget) return 'completed' // Atingiu 200h
  if (hoursWorked >= monthlyMin) {
    // Entre 180-200h
    if (hoursWorked >= monthlyTarget * 0.95) return 'almost-complete' // Próximo de 200h
    return 'optimal' // Na faixa ideal
  }
  // Abaixo de 180h
  if (isOnTrack) return 'on-track' // No caminho para atingir 180h
  if (hoursWorked >= monthlyMin * 0.5) return 'behind' // Atrasado mas recuperável
  return 'critical' // Muito atrasado
}

export const workingDaysService = {
  isHoliday,
  isWeekend,
  isWorkingDay,
  getWorkingDaysInMonth,
  getRemainingWorkingDays,
  getWorkedDaysInMonth,
  getActualWorkedDaysInMonth,
  getRemainingDaysInMonth,
  getMonthlyProgress,
  getHolidays,
  /**
   * Pré-carrega feriados no cache de memoização até 2030
   */
  preloadHolidaysUpTo2030() {
    const start = new Date().getFullYear()
    const end = 2030
    for (let year = start; year <= end; year++) {
      getHolidays(year)
    }
  }
}