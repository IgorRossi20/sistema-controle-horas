// Script de diagnóstico para verificar divergência nos cálculos de horas
// Dashboard: 22.26 horas vs Relatórios: 25.46 horas

import { timeEntriesService } from './src/services/firebase.js'
import { auth } from './src/main.js'

// Função para converter horas H.MM para minutos
function hoursToMinutes(hoursStr) {
  if (!hoursStr) return 0
  const [hours, minutes] = hoursStr.toString().split('.').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

// Função para converter minutos para H.MM
function minutesToHours(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}.${mins.toString().padStart(2, '0')}`
}

// Função para simular o cálculo do Dashboard
function calculateDashboardHours(timeEntries) {
  console.log('\n=== CÁLCULO DO DASHBOARD ===')
  
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Primeiro e último dia do mês atual
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  
  console.log(`Período Dashboard: ${firstDay.toLocaleDateString()} a ${lastDay.toLocaleDateString()}`)
  
  // Filtrar entradas do mês atual
  const currentMonthEntries = timeEntries.filter(entry => {
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
    
    return entryDate >= firstDay && entryDate <= lastDay
  })
  
  console.log(`Entradas encontradas no Dashboard: ${currentMonthEntries.length}`)
  
  // Calcular total de horas
  let totalMinutes = 0
  currentMonthEntries.forEach((entry, index) => {
    const minutes = hoursToMinutes(entry.hours)
    totalMinutes += minutes
    console.log(`${index + 1}. Data: ${new Date(entry.date).toLocaleDateString()}, Horas: ${entry.hours}, Minutos: ${minutes}, Projeto: ${entry.projectId}`)
  })
  
  const totalHours = minutesToHours(totalMinutes)
  console.log(`Total Dashboard: ${totalHours} (${totalMinutes} minutos)`)
  
  return { totalHours, totalMinutes, entries: currentMonthEntries }
}

// Função para simular o cálculo dos Relatórios
function calculateReportsHours(timeEntries, startDate, endDate) {
  console.log('\n=== CÁLCULO DOS RELATÓRIOS ===')
  console.log(`Período Relatórios: ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`)
  
  // Filtrar entradas do período
  const filteredEntries = timeEntries.filter(entry => {
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
    
    return entryDate >= startDate && entryDate <= endDate
  })
  
  console.log(`Entradas encontradas nos Relatórios: ${filteredEntries.length}`)
  
  // Calcular total de horas
  let totalMinutes = 0
  filteredEntries.forEach((entry, index) => {
    const minutes = hoursToMinutes(entry.hours)
    totalMinutes += minutes
    console.log(`${index + 1}. Data: ${new Date(entry.date).toLocaleDateString()}, Horas: ${entry.hours}, Minutos: ${minutes}, Projeto: ${entry.projectId}`)
  })
  
  const totalHours = minutesToHours(totalMinutes)
  console.log(`Total Relatórios: ${totalHours} (${totalMinutes} minutos)`)
  
  return { totalHours, totalMinutes, entries: filteredEntries }
}

// Função principal de diagnóstico
async function diagnoseDivergence() {
  try {
    console.log('🔍 INICIANDO DIAGNÓSTICO DE DIVERGÊNCIA NAS HORAS')
    console.log('Dashboard reporta: 22.26 horas')
    console.log('Relatórios reporta: 25.46 horas')
    console.log('Diferença: 3.20 horas (3h 20min)')
    
    // Obter usuário atual
    const user = auth.currentUser
    if (!user) {
      console.error('❌ Usuário não autenticado')
      return
    }
    
    console.log(`\n👤 Usuário: ${user.uid}`)
    
    // Buscar TODOS os registros do usuário
    console.log('\n📊 Buscando todos os registros...')
    const allTimeEntries = await timeEntriesService.getTimeEntries(user.uid)
    console.log(`Total de registros encontrados: ${allTimeEntries.length}`)
    
    // Calcular como o Dashboard faz
    const dashboardResult = calculateDashboardHours(allTimeEntries)
    
    // Simular o período que os Relatórios estão usando
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const startDate = new Date(currentYear, currentMonth, 1)
    const endDate = new Date(currentYear, currentMonth + 1, 0)
    
    // Calcular como os Relatórios fazem
    const reportsResult = calculateReportsHours(allTimeEntries, startDate, endDate)
    
    // Comparar resultados
    console.log('\n📊 COMPARAÇÃO DOS RESULTADOS:')
    console.log(`Dashboard: ${dashboardResult.totalHours} (${dashboardResult.totalMinutes} min)`)
    console.log(`Relatórios: ${reportsResult.totalHours} (${reportsResult.totalMinutes} min)`)
    console.log(`Diferença: ${reportsResult.totalMinutes - dashboardResult.totalMinutes} minutos`)
    
    // Verificar se há entradas diferentes
    console.log('\n🔍 ANÁLISE DAS DIFERENÇAS:')
    
    const dashboardIds = new Set(dashboardResult.entries.map(e => e.id))
    const reportsIds = new Set(reportsResult.entries.map(e => e.id))
    
    const onlyInDashboard = dashboardResult.entries.filter(e => !reportsIds.has(e.id))
    const onlyInReports = reportsResult.entries.filter(e => !dashboardIds.has(e.id))
    
    if (onlyInDashboard.length > 0) {
      console.log(`\n⚠️  Entradas APENAS no Dashboard (${onlyInDashboard.length}):`)
      onlyInDashboard.forEach(entry => {
        console.log(`- ${new Date(entry.date).toLocaleDateString()}: ${entry.hours}h - ${entry.description}`)
      })
    }
    
    if (onlyInReports.length > 0) {
      console.log(`\n⚠️  Entradas APENAS nos Relatórios (${onlyInReports.length}):`)
      onlyInReports.forEach(entry => {
        console.log(`- ${new Date(entry.date).toLocaleDateString()}: ${entry.hours}h - ${entry.description}`)
      })
    }
    
    if (onlyInDashboard.length === 0 && onlyInReports.length === 0) {
      console.log('✅ Ambos usam as mesmas entradas')
      console.log('❓ A diferença pode estar na lógica de cálculo das horas')
      
      // Verificar se há diferenças na conversão de horas
      console.log('\n🔍 VERIFICANDO CONVERSÃO DE HORAS:')
      dashboardResult.entries.forEach((entry, index) => {
        const dashboardMinutes = hoursToMinutes(entry.hours)
        const reportsEntry = reportsResult.entries.find(e => e.id === entry.id)
        if (reportsEntry) {
          const reportsMinutes = hoursToMinutes(reportsEntry.hours)
          if (dashboardMinutes !== reportsMinutes) {
            console.log(`⚠️  Diferença na entrada ${entry.id}:`)
            console.log(`   Dashboard: ${entry.hours} = ${dashboardMinutes} min`)
            console.log(`   Relatórios: ${reportsEntry.hours} = ${reportsMinutes} min`)
          }
        }
      })
    }
    
    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO')
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error)
  }
}

// Executar diagnóstico
diagnoseDivergence()

export { diagnoseDivergence }