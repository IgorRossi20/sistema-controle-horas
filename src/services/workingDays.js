/**
 * Serviço para calcular dias úteis e gerenciar metas de horas mensais
 */

// Feriados nacionais brasileiros fixos
const FIXED_HOLIDAYS = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalhador',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '12-25': 'Natal'
}

/**
 * Calcula a Páscoa para um determinado ano
 * @param {number} year - Ano
 * @returns {Date} - Data da Páscoa
 */
function calculateEaster(year) {
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
}

/**
 * Obtém todos os feriados para um determinado ano
 * @param {number} year - Ano
 * @returns {Date[]} - Array de datas dos feriados
 */
function getHolidays(year) {
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
}

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
 * Verifica se uma data é dia útil
 * @param {Date} date - Data a verificar
 * @returns {boolean} - True se for dia útil
 */
function isWorkingDay(date) {
  return !isWeekend(date) && !isHoliday(date)
}

/**
 * Calcula o número de dias úteis em um mês
 * @param {number} year - Ano
 * @param {number} month - Mês (0-11)
 * @returns {number} - Número de dias úteis
 */
function getWorkingDaysInMonth(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let workingDays = 0
  
  for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
    if (isWorkingDay(date)) {
      workingDays++
    }
  }
  
  return workingDays
}

/**
 * Calcula o número de dias úteis restantes no mês
 * @param {Date} currentDate - Data atual
 * @returns {number} - Número de dias úteis restantes
 */
function getRemainingWorkingDays(currentDate = new Date()) {
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
}

/**
 * Calcula o número de dias úteis trabalhados no mês até a data atual
 * @param {Date} currentDate - Data atual
 * @returns {number} - Número de dias úteis trabalhados
 */
function getWorkedDaysInMonth(currentDate = new Date()) {
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
}

/**
 * Calcula estatísticas de progresso mensal para a faixa de 180-200 horas
 * @param {number} hoursWorked - Horas já trabalhadas no mês
 * @param {Date} currentDate - Data atual
 * @returns {Object} - Estatísticas de progresso
 */
function getMonthlyProgress(hoursWorked, currentDate = new Date()) {
  const MONTHLY_MIN = 180
  const MONTHLY_TARGET = 200
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const totalWorkingDays = getWorkingDaysInMonth(year, month)
  const workedDays = getWorkedDaysInMonth(currentDate)
  const remainingDays = getRemainingWorkingDays(currentDate)
  
  // Calcular progresso baseado na faixa 180-200
  const progressPercentage = (hoursWorked / MONTHLY_TARGET) * 100
  const minProgressPercentage = (hoursWorked / MONTHLY_MIN) * 100
  
  // Calcular horas restantes baseado no contexto atual
  let targetHours = MONTHLY_TARGET
  if (hoursWorked < MONTHLY_MIN) {
    // Se ainda não atingiu o mínimo, foca em atingir 180h
    targetHours = MONTHLY_MIN
  } else if (hoursWorked >= MONTHLY_MIN && hoursWorked < MONTHLY_TARGET) {
    // Se já atingiu o mínimo, pode mirar nas 200h sem pressão
    targetHours = MONTHLY_TARGET
  } else {
    // Se já passou de 200h, não precisa trabalhar mais
    targetHours = hoursWorked
  }
  
  const remainingHours = Math.max(0, targetHours - hoursWorked)
  const averageHoursPerDay = remainingDays > 0 ? remainingHours / remainingDays : 0
  
  // Expectativa baseada no mínimo de 180h
  const expectedMinHours = (workedDays / totalWorkingDays) * MONTHLY_MIN
  const expectedTargetHours = (workedDays / totalWorkingDays) * MONTHLY_TARGET
  const isOnTrack = hoursWorked >= expectedMinHours
  
  return {
    monthlyMin: MONTHLY_MIN,
    monthlyTarget: MONTHLY_TARGET,
    targetHours,
    hoursWorked,
    remainingHours,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    minProgressPercentage: Math.round(minProgressPercentage * 100) / 100,
    totalWorkingDays,
    workedDays,
    remainingDays,
    averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
    expectedMinHours: Math.round(expectedMinHours * 100) / 100,
    expectedTargetHours: Math.round(expectedTargetHours * 100) / 100,
    isOnTrack,
    status: getProgressStatus(hoursWorked, MONTHLY_MIN, MONTHLY_TARGET, isOnTrack)
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
  getMonthlyProgress,
  getHolidays
}