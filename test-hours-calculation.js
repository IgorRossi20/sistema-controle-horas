// Script para testar cálculos de horas específicos
// Teste: 30min=0.5h, 60min=1.0h, 90min=1.5h

console.log('🧪 TESTANDO CÁLCULOS DE HORAS');
console.log('Regra: 60 minutos = 1 hora, 30 minutos = 0.5 horas');
console.log('Formato: Horas decimais (ex: 1.5 = 1h30min)');

// Função CORRETA para TimeEntries.vue
function calculatedHours(startTime, endTime) {
  if (!startTime || !endTime) return '0.00';
  
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diffMs = end.getTime() - start.getTime();
  const totalMinutes = diffMs / (1000 * 60);
  
  // Conversão CORRETA para horas decimais
  const hoursDecimal = totalMinutes / 60;
  return hoursDecimal.toFixed(2);
}

// Função CORRETA para Reports.vue
function formatHoursFromMinutes(totalMinutes) {
  if (!totalMinutes) return '0.00';
  
  // Conversão CORRETA para horas decimais
  const hoursDecimal = totalMinutes / 60;
  return hoursDecimal.toFixed(2);
}

// Testes específicos
console.log('\n📊 TESTES COM DADOS ESPECÍFICOS:');

// Teste 1: 30 minutos = 0.50 horas
console.log('\n🔸 Teste 1: 30 minutos');
const test1_start = '09:00';
const test1_end = '09:30';
const test1_result = calculatedHours(test1_start, test1_end);
console.log(`TimeEntries: ${test1_start} - ${test1_end} = ${test1_result}h`);
const test1_reports = formatHoursFromMinutes(30);
console.log(`Reports: 30 minutos = ${test1_reports}h`);
console.log(`✅ Esperado: 0.50h | Resultado: ${test1_result === '0.50' ? '✅ CORRETO' : '❌ INCORRETO'}`);

// Teste 2: 60 minutos = 1.00 horas
console.log('\n🔸 Teste 2: 60 minutos');
const test2_start = '09:00';
const test2_end = '10:00';
const test2_result = calculatedHours(test2_start, test2_end);
console.log(`TimeEntries: ${test2_start} - ${test2_end} = ${test2_result}h`);
const test2_reports = formatHoursFromMinutes(60);
console.log(`Reports: 60 minutos = ${test2_reports}h`);
console.log(`✅ Esperado: 1.00h | Resultado: ${test2_result === '1.00' ? '✅ CORRETO' : '❌ INCORRETO'}`);

// Teste 3: 90 minutos = 1.50 horas
console.log('\n🔸 Teste 3: 90 minutos');
const test3_start = '09:00';
const test3_end = '10:30';
const test3_result = calculatedHours(test3_start, test3_end);
console.log(`TimeEntries: ${test3_start} - ${test3_end} = ${test3_result}h`);
const test3_reports = formatHoursFromMinutes(90);
console.log(`Reports: 90 minutos = ${test3_reports}h`);
console.log(`✅ Esperado: 1.50h | Resultado: ${test3_result === '1.50' ? '✅ CORRETO' : '❌ INCORRETO'}`);

// Teste 4: 120 minutos = 2.00 horas
console.log('\n🔸 Teste 4: 120 minutos');
const test4_start = '09:00';
const test4_end = '11:00';
const test4_result = calculatedHours(test4_start, test4_end);
console.log(`TimeEntries: ${test4_start} - ${test4_end} = ${test4_result}h`);
const test4_reports = formatHoursFromMinutes(120);
console.log(`Reports: 120 minutos = ${test4_reports}h`);
console.log(`✅ Esperado: 2.00h | Resultado: ${test4_result === '2.00' ? '✅ CORRETO' : '❌ INCORRETO'}`);

// Teste 5: 150 minutos = 2.50 horas
console.log('\n🔸 Teste 5: 150 minutos');
const test5_start = '09:00';
const test5_end = '11:30';
const test5_result = calculatedHours(test5_start, test5_end);
console.log(`TimeEntries: ${test5_start} - ${test5_end} = ${test5_result}h`);
const test5_reports = formatHoursFromMinutes(150);
console.log(`Reports: 150 minutos = ${test5_reports}h`);
console.log(`✅ Esperado: 2.50h | Resultado: ${test5_result === '2.50' ? '✅ CORRETO' : '❌ INCORRETO'}`);

// Teste 6: 45 minutos = 0.75 horas
console.log('\n🔸 Teste 6: 45 minutos');
const test6_start = '09:00';
const test6_end = '09:45';
const test6_result = calculatedHours(test6_start, test6_end);
console.log(`TimeEntries: ${test6_start} - ${test6_end} = ${test6_result}h`);
const test6_reports = formatHoursFromMinutes(45);
console.log(`Reports: 45 minutos = ${test6_reports}h`);
console.log(`✅ Esperado: 0.75h | Resultado: ${test6_result === '0.75' ? '✅ CORRETO' : '❌ INCORRETO'}`);

console.log('\n🎯 RESUMO DOS TESTES:');
console.log('- 30 min = 0.50h:', test1_result === '0.50' ? '✅' : '❌');
console.log('- 60 min = 1.00h:', test2_result === '1.00' ? '✅' : '❌');
console.log('- 90 min = 1.50h:', test3_result === '1.50' ? '✅' : '❌');
console.log('- 120 min = 2.00h:', test4_result === '2.00' ? '✅' : '❌');
console.log('- 150 min = 2.50h:', test5_result === '2.50' ? '✅' : '❌');
console.log('- 45 min = 0.75h:', test6_result === '0.75' ? '✅' : '❌');

const allTestsPassed = [
  test1_result === '0.50',
  test2_result === '1.00',
  test3_result === '1.50',
  test4_result === '2.00',
  test5_result === '2.50',
  test6_result === '0.75'
].every(test => test);

console.log('\n🏆 RESULTADO FINAL:', allTestsPassed ? '✅ TODOS OS TESTES PASSARAM!' : '❌ ALGUNS TESTES FALHARAM');

// Exportar funções para uso no console
if (typeof window !== 'undefined') {
  window.testHoursCalculation = {
    calculatedHours,
    formatHoursFromMinutes
  };
  console.log('\n🔧 Funções disponíveis em window.testHoursCalculation');
}