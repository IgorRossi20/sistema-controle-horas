// Script detalhado para comparar Dashboard vs Relatórios
// Execute este script no console do navegador

console.log('🔍 Iniciando comparação detalhada Dashboard vs Relatórios...');

// Função para simular exatamente o que o Dashboard faz
function simulateDashboardLogic() {
  console.log('📊 === SIMULAÇÃO DASHBOARD ===');
  
  // Exatamente como no Dashboard.vue
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  
  console.log('📅 Dashboard - Período calculado:');
  console.log('  Primeiro dia:', firstDayOfMonth.toISOString());
  console.log('  Último dia:', lastDayOfMonth.toISOString());
  console.log('  Mês atual:', currentMonth + 1);
  console.log('  Ano atual:', currentYear);
  
  return { firstDayOfMonth, lastDayOfMonth, currentMonth, currentYear };
}

// Função para simular exatamente o que os Relatórios fazem
function simulateReportsLogic() {
  console.log('📋 === SIMULAÇÃO RELATÓRIOS ===');
  
  // Como mostrado na imagem: Agosto de 2025
  const selectedMonth = 8; // Agosto
  const selectedYear = 2025;
  
  // Exatamente como no Reports.vue
  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
  
  console.log('📅 Relatórios - Período calculado:');
  console.log('  Data início:', startDate.toISOString());
  console.log('  Data fim:', endDate.toISOString());
  console.log('  Mês selecionado:', selectedMonth);
  console.log('  Ano selecionado:', selectedYear);
  
  return { startDate, endDate, selectedMonth, selectedYear };
}

// Função para comparar os períodos
function comparePeriods() {
  console.log('⚖️ === COMPARAÇÃO DE PERÍODOS ===');
  
  const dashboard = simulateDashboardLogic();
  const reports = simulateReportsLogic();
  
  const dashboardStart = dashboard.firstDayOfMonth;
  const dashboardEnd = dashboard.lastDayOfMonth;
  const reportsStart = reports.startDate;
  const reportsEnd = reports.endDate;
  
  console.log('🔄 Comparando timestamps:');
  console.log('Dashboard início:', dashboardStart.getTime(), '(' + dashboardStart.toLocaleDateString('pt-BR') + ')');
  console.log('Relatórios início:', reportsStart.getTime(), '(' + reportsStart.toLocaleDateString('pt-BR') + ')');
  console.log('Dashboard fim:', dashboardEnd.getTime(), '(' + dashboardEnd.toLocaleDateString('pt-BR') + ')');
  console.log('Relatórios fim:', reportsEnd.getTime(), '(' + reportsEnd.toLocaleDateString('pt-BR') + ')');
  
  const sameStart = dashboardStart.getTime() === reportsStart.getTime();
  const sameEnd = dashboardEnd.getTime() === reportsEnd.getTime();
  
  if (!sameStart || !sameEnd) {
    console.log('🚨 PERÍODOS DIFERENTES!');
    console.log('Dashboard:', dashboard.currentMonth + 1 + '/' + dashboard.currentYear);
    console.log('Relatórios:', reports.selectedMonth + '/' + reports.selectedYear);
    return false;
  } else {
    console.log('✅ Períodos são idênticos');
    return true;
  }
}

// Função para simular cálculo de horas do Dashboard
function simulateDashboardHoursCalculation(timeEntries) {
  console.log('🧮 === CÁLCULO DASHBOARD ===');
  
  if (!timeEntries || timeEntries.length === 0) {
    console.log('❌ Nenhuma entrada de tempo fornecida');
    return 0;
  }
  
  let totalMinutes = 0;
  
  timeEntries.forEach((entry, index) => {
    console.log(`Entrada ${index + 1}:`, entry);
    
    if (entry.startTime && entry.endTime) {
      const start = new Date(`1970-01-01T${entry.startTime}:00`);
      const end = new Date(`1970-01-01T${entry.endTime}:00`);
      const diffMs = end.getTime() - start.getTime();
      const minutes = diffMs / (1000 * 60);
      
      console.log(`  Início: ${entry.startTime}, Fim: ${entry.endTime}`);
      console.log(`  Diferença: ${minutes} minutos`);
      
      totalMinutes += minutes;
    }
  });
  
  const totalHours = totalMinutes / 60;
  console.log(`📊 Dashboard Total: ${totalMinutes} minutos = ${totalHours.toFixed(2)} horas`);
  
  return totalHours;
}

// Função para simular cálculo de horas dos Relatórios
function simulateReportsHoursCalculation(timeEntries) {
  console.log('🧮 === CÁLCULO RELATÓRIOS ===');
  
  if (!timeEntries || timeEntries.length === 0) {
    console.log('❌ Nenhuma entrada de tempo fornecida');
    return 0;
  }
  
  let totalMinutes = 0;
  
  timeEntries.forEach((entry, index) => {
    console.log(`Entrada ${index + 1}:`, entry);
    
    if (entry.startTime && entry.endTime) {
      const start = new Date(`1970-01-01T${entry.startTime}:00`);
      const end = new Date(`1970-01-01T${entry.endTime}:00`);
      const diffMs = end.getTime() - start.getTime();
      const minutes = diffMs / (1000 * 60);
      
      console.log(`  Início: ${entry.startTime}, Fim: ${entry.endTime}`);
      console.log(`  Diferença: ${minutes} minutos`);
      
      totalMinutes += minutes;
    }
  });
  
  const totalHours = totalMinutes / 60;
  console.log(`📋 Relatórios Total: ${totalMinutes} minutos = ${totalHours.toFixed(2)} horas`);
  
  return totalHours;
}

// Função principal de diagnóstico
function runDetailedDiagnosis() {
  console.log('🚀 === DIAGNÓSTICO DETALHADO ===');
  
  // 1. Comparar períodos
  const periodsMatch = comparePeriods();
  
  if (!periodsMatch) {
    console.log('🎯 CAUSA IDENTIFICADA: Períodos diferentes!');
    console.log('💡 SOLUÇÃO: Verificar se ambos estão usando o mesmo mês/ano');
  }
  
  // 2. Instruções para testar com dados reais
  console.log('\n📡 === PRÓXIMOS PASSOS ===');
  console.log('Para testar com dados reais, execute no console:');
  console.log('\n// 1. Obter dados do Dashboard');
  console.log('const dashboardPeriod = simulateDashboardLogic();');
  console.log('const dashboardData = await timeEntriesService.getTimeEntriesByPeriod(userId, dashboardPeriod.firstDayOfMonth, dashboardPeriod.lastDayOfMonth);');
  console.log('console.log("Dashboard dados:", dashboardData);');
  console.log('const dashboardHours = simulateDashboardHoursCalculation(dashboardData);');
  
  console.log('\n// 2. Obter dados dos Relatórios');
  console.log('const reportsPeriod = simulateReportsLogic();');
  console.log('const reportsData = await timeEntriesService.getTimeEntriesByPeriod(userId, reportsPeriod.startDate, reportsPeriod.endDate);');
  console.log('console.log("Relatórios dados:", reportsData);');
  console.log('const reportsHours = simulateReportsHoursCalculation(reportsData);');
  
  console.log('\n// 3. Comparar resultados');
  console.log('console.log("Dashboard:", dashboardHours, "horas");');
  console.log('console.log("Relatórios:", reportsHours, "horas");');
  
  console.log('\n✅ Diagnóstico preparado! Execute os comandos acima para análise detalhada.');
}

// Executar diagnóstico
runDetailedDiagnosis();

// Exportar funções para uso manual
window.debugFunctions = {
  simulateDashboardLogic,
  simulateReportsLogic,
  comparePeriods,
  simulateDashboardHoursCalculation,
  simulateReportsHoursCalculation,
  runDetailedDiagnosis
};

console.log('🔧 Funções de debug disponíveis em window.debugFunctions');