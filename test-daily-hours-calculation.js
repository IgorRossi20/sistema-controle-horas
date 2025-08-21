// Script para testar cálculo de horas por dia nos relatórios

// Simular dados da imagem fornecida pelo usuário
const testEntries = [
  { id: '1', hours: '0.30', description: 'Atividade 1', date: '2025-08-19', projectId: 'proj1' },
  { id: '2', hours: '0.30', description: 'Atividade 2', date: '2025-08-19', projectId: 'proj2' },
  { id: '3', hours: '1.00', description: 'Atividade 3', date: '2025-08-19', projectId: 'proj3' },
  { id: '4', hours: '0.30', description: 'Atividade 4', date: '2025-08-19', projectId: 'proj4' },
  { id: '5', hours: '0.50', description: 'Atividade 5', date: '2025-08-19', projectId: 'proj5' },
  { id: '6', hours: '0.30', description: 'Atividade 6', date: '2025-08-19', projectId: 'proj6' },
  { id: '7', hours: '1.15', description: 'Atividade 7', date: '2025-08-19', projectId: 'proj7' },
  { id: '8', hours: '3.00', description: 'Atividade 8', date: '2025-08-19', projectId: 'proj8' },
  { id: '9', hours: '0.30', description: 'Atividade 9', date: '2025-08-19', projectId: 'proj9' }
]

// Função para simular o cálculo do Reports.vue
function calculateDailyHours(entries) {
  const dailyData = {}
  
  entries.forEach(entry => {
    if (!entry || typeof entry !== 'object' || !entry.date) {
      return
    }
    
    const dateKey = entry.date
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        entries: [],
        totalHours: 0,
        projects: new Set()
      }
    }
    
    dailyData[dateKey].entries.push(entry)
    
    // As horas já estão em formato decimal (ex: 1.50 = 1h30min)
    const hours = parseFloat(entry.hours)
    if (!isNaN(hours)) {
      dailyData[dateKey].totalHours += hours
    }
    
    dailyData[dateKey].projects.add(entry.projectId)
  })
  
  return dailyData
}

// Função para simular formatHoursFromMinutes (que não deveria ser usada aqui)
function formatHoursFromMinutes(totalMinutes) {
  if (!totalMinutes) return '0.00'
  
  // Conversão CORRETA para formato H.MM
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  // Formato H.MM onde MM são os minutos reais
  const result = hours + (minutes / 100)
  return result.toFixed(2)
}

console.log('=== TESTE DE CÁLCULO DE HORAS DIÁRIAS ===')
console.log('\nDados de entrada:')
testEntries.forEach(entry => {
  console.log(`- ${entry.description}: ${entry.hours}h`)
})

// Calcular total esperado
const expectedTotal = testEntries.reduce((sum, entry) => {
  return sum + parseFloat(entry.hours)
}, 0)

console.log(`\nTotal esperado: ${expectedTotal.toFixed(2)}h`)

// Simular cálculo do Reports.vue
const dailyData = calculateDailyHours(testEntries)
const calculatedTotal = dailyData['2025-08-19'].totalHours

console.log(`Total calculado pelo Reports.vue: ${calculatedTotal.toFixed(2)}h`)

// Verificar se formatHoursFromMinutes está sendo usado incorretamente
const incorrectFormatted = formatHoursFromMinutes(calculatedTotal)
console.log(`Se formatHoursFromMinutes fosse usado (INCORRETO): ${incorrectFormatted}h`)

// Verificar se os totais coincidem
if (Math.abs(expectedTotal - calculatedTotal) < 0.01) {
  console.log('\n✅ CÁLCULO CORRETO: Os totais coincidem!')
} else {
  console.log('\n❌ ERRO NO CÁLCULO: Os totais não coincidem!')
  console.log(`Diferença: ${Math.abs(expectedTotal - calculatedTotal).toFixed(2)}h`)
}

// Verificar se o problema está na exibição
console.log('\n=== ANÁLISE DO PROBLEMA ===')
console.log('1. O cálculo interno está correto?', Math.abs(expectedTotal - calculatedTotal) < 0.01 ? 'SIM' : 'NÃO')
console.log('2. O problema pode estar na função formatHoursFromMinutes sendo usada incorretamente')
console.log('3. No template, deveria mostrar:', calculatedTotal.toFixed(2) + 'h')
console.log('4. Se estiver usando formatHoursFromMinutes, mostrará:', incorrectFormatted + 'h')

console.log('\n=== VERIFICAÇÃO INDIVIDUAL ===')
testEntries.forEach(entry => {
  const parsed = parseFloat(entry.hours)
  console.log(`${entry.description}: "${entry.hours}" -> ${parsed} (${typeof parsed})`)
})