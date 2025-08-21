// Script para diagnosticar divergência entre Dashboard e Relatórios
// Execute este script no console do navegador

console.log('🔍 Iniciando diagnóstico de divergência...');

// Função para simular o cálculo do Dashboard
function simulateDashboardCalculation() {
  console.log('📊 Simulando cálculo do Dashboard...');
  
  // Obter dados atuais (simular)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Calcular primeiro e último dia do mês atual
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  console.log('📅 Dashboard - Período:', {
    firstDay: firstDayOfMonth.toISOString(),
    lastDay: lastDayOfMonth.toISOString(),
    month: currentMonth + 1,
    year: currentYear
  });
  
  return { firstDayOfMonth, lastDayOfMonth, currentMonth, currentYear };
}

// Função para simular o cálculo dos Relatórios
function simulateReportsCalculation() {
  console.log('📋 Simulando cálculo dos Relatórios...');
  
  // Agosto de 2025 (como mostrado na imagem)
  const selectedMonth = 8; // Agosto
  const selectedYear = 2025;
  
  // Calcular período para relatórios
  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
  
  console.log('📅 Relatórios - Período:', {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    month: selectedMonth,
    year: selectedYear
  });
  
  return { startDate, endDate, selectedMonth, selectedYear };
}

// Função para comparar períodos
function comparePeriods() {
  console.log('🔄 Comparando períodos...');
  
  const dashboard = simulateDashboardCalculation();
  const reports = simulateReportsCalculation();
  
  const dashboardStart = dashboard.firstDayOfMonth;
  const dashboardEnd = dashboard.lastDayOfMonth;
  const reportsStart = reports.startDate;
  const reportsEnd = reports.endDate;
  
  console.log('⚖️ Comparação de períodos:');
  console.log('Dashboard:', {
    inicio: dashboardStart.toLocaleDateString('pt-BR'),
    fim: dashboardEnd.toLocaleDateString('pt-BR'),
    mes: dashboard.currentMonth + 1,
    ano: dashboard.currentYear
  });
  
  console.log('Relatórios:', {
    inicio: reportsStart.toLocaleDateString('pt-BR'),
    fim: reportsEnd.toLocaleDateString('pt-BR'),
    mes: reports.selectedMonth,
    ano: reports.selectedYear
  });
  
  // Verificar se os períodos são diferentes
  const sameStart = dashboardStart.getTime() === reportsStart.getTime();
  const sameEnd = dashboardEnd.getTime() === reportsEnd.getTime();
  
  if (!sameStart || !sameEnd) {
    console.log('🚨 DIVERGÊNCIA ENCONTRADA: Os períodos são diferentes!');
    console.log('Dashboard está filtrando:', dashboard.currentMonth + 1 + '/' + dashboard.currentYear);
    console.log('Relatórios está filtrando:', reports.selectedMonth + '/' + reports.selectedYear);
    return false;
  } else {
    console.log('✅ Os períodos são iguais');
    return true;
  }
}

// Função para verificar dados no Firebase
async function checkFirebaseData() {
  console.log('🔥 Verificando dados no Firebase...');
  
  try {
    // Simular busca de dados (você precisará adaptar isso)
    console.log('📡 Simulando busca de dados...');
    
    // Aqui você pode adicionar código real para buscar dados do Firebase
    // usando as funções timeEntriesService.getTimeEntries() e timeEntriesService.getTimeEntriesByPeriod()
    
    console.log('ℹ️ Para verificar dados reais, execute no console da aplicação:');
    console.log('timeEntriesService.getTimeEntries(userId)');
    console.log('timeEntriesService.getTimeEntriesByPeriod(userId, startDate, endDate)');
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  }
}

// Executar diagnóstico
function runDiagnosis() {
  console.log('🚀 Executando diagnóstico completo...');
  
  const periodsMatch = comparePeriods();
  
  if (!periodsMatch) {
    console.log('🎯 CAUSA PROVÁVEL: Dashboard e Relatórios estão filtrando períodos diferentes!');
    console.log('💡 SOLUÇÃO: Verificar se ambos estão usando o mesmo mês/ano atual');
  }
  
  checkFirebaseData();
  
  console.log('✅ Diagnóstico concluído!');
}

// Executar
runDiagnosis();