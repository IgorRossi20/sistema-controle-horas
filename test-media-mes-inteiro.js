// Teste da nova média considerando o mês inteiro de agosto

// Simular as funções necessárias
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

function isHoliday(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateKey = `${month}-${day}`
  
  if (FIXED_HOLIDAYS[dateKey]) {
    return true
  }
  
  const easter = calculateEaster(year)
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  const carnival = new Date(easter)
  carnival.setDate(easter.getDate() - 47)
  const carnivalTuesday = new Date(easter)
  carnivalTuesday.setDate(easter.getDate() - 46)
  const corpusChristi = new Date(easter)
  corpusChristi.setDate(easter.getDate() + 60)
  
  const variableHolidays = [goodFriday, carnival, carnivalTuesday, corpusChristi]
  
  return variableHolidays.some(holiday => 
    holiday.getDate() === date.getDate() && 
    holiday.getMonth() === date.getMonth() && 
    holiday.getFullYear() === date.getFullYear()
  )
}

function isWeekend(date) {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

function isWorkingDay(date) {
  return !isWeekend(date) && !isHoliday(date)
}

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

// Teste com agosto de 2025
const currentDate = new Date(2025, 7, 20) // 20 de agosto de 2025
const year = currentDate.getFullYear()
const month = currentDate.getMonth()

const totalWorkingDays = getWorkingDaysInMonth(year, month)
const MONTHLY_MIN = 180
const MONTHLY_TARGET = 200
const hoursWorked = 1

// Calcular target hours (como na função original)
let targetHours = MONTHLY_TARGET
if (hoursWorked < MONTHLY_MIN) {
  targetHours = MONTHLY_MIN
} else if (hoursWorked >= MONTHLY_MIN && hoursWorked < MONTHLY_TARGET) {
  targetHours = MONTHLY_TARGET
} else {
  targetHours = hoursWorked
}

// Nova média considerando o mês inteiro
const averageHoursPerWorkingDay = totalWorkingDays > 0 ? targetHours / totalWorkingDays : 0

console.log('=== TESTE DA NOVA MÉDIA - MÊS INTEIRO DE AGOSTO ===');
console.log(`Data atual: ${currentDate.toLocaleDateString('pt-BR')}`);
console.log(`Total de dias úteis em agosto 2025: ${totalWorkingDays}`);
console.log(`Horas trabalhadas: ${hoursWorked}`);
console.log(`Target hours: ${targetHours}`);
console.log(`Nova média por dia útil (mês inteiro): ${averageHoursPerWorkingDay.toFixed(2)}`);
console.log('');
console.log('Comparação:');
console.log(`- Média anterior (dias restantes): 22.38`);
console.log(`- Nova média (mês inteiro): ${averageHoursPerWorkingDay.toFixed(2)}`);
console.log('');
console.log('Interpretação:');
console.log(`- Para atingir ${targetHours}h em ${totalWorkingDays} dias úteis`);
console.log(`- Precisa trabalhar ${averageHoursPerWorkingDay.toFixed(2)}h por dia útil em média`);
console.log(`- Considerando o mês inteiro, não apenas os dias restantes`);