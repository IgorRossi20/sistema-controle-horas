/**
 * Debug com a data atual real
 */

import { workingDaysService } from './src/services/workingDays.js';

console.log('=== DEBUG COM DATA ATUAL REAL ===');

// Usar a data atual real
const currentDate = new Date();
console.log('Data atual real:', currentDate.toLocaleDateString('pt-BR'));
console.log('Ano:', currentDate.getFullYear());
console.log('Mês (0-11):', currentDate.getMonth());
console.log('Dia:', currentDate.getDate());
console.log('Dia da semana:', currentDate.getDay(), '(0=Dom, 1=Seg, ...)');

// Testar com a data atual real
const remainingWorkingDays = workingDaysService.getRemainingWorkingDays(currentDate);
console.log('\n=== Dias úteis restantes (data real) ===');
console.log('Dias úteis restantes:', remainingWorkingDays);

// Simular o cenário do dashboard
const hoursWorked = 1; // 1 hora trabalhada conforme mostrado na imagem
const timeEntries = []; // Vazio por enquanto
const monthlyProgress = workingDaysService.getMonthlyProgress(hoursWorked, currentDate, timeEntries);

console.log('\n=== Progresso mensal (data real) ===');
console.log('Horas trabalhadas:', monthlyProgress.hoursWorked);
console.log('Horas restantes:', monthlyProgress.remainingHours);
console.log('Média por dia útil:', monthlyProgress.averageHoursPerDay);

// Verificar se a média bate com 22.38
if (Math.abs(monthlyProgress.averageHoursPerDay - 22.38) < 0.1) {
  console.log('\n✅ PROBLEMA IDENTIFICADO!');
  console.log('A média de 22.38 está correta para a data atual real.');
  console.log('O problema era que eu estava testando com 12 de agosto, mas hoje é uma data diferente.');
} else {
  console.log('\n🤔 A média ainda não bate...');
  console.log('Média calculada:', monthlyProgress.averageHoursPerDay);
  console.log('Média esperada: 22.38');
}

// Calcular manualmente para confirmar
const manualAverage = monthlyProgress.remainingHours / remainingWorkingDays;
console.log('\n=== Verificação manual ===');
console.log('Horas restantes:', monthlyProgress.remainingHours);
console.log('Dias úteis restantes:', remainingWorkingDays);
console.log('Média manual:', manualAverage.toFixed(2));

// Mostrar detalhes do mês atual
console.log('\n=== Detalhes do mês ===');
console.log('Total de dias úteis no mês:', monthlyProgress.totalWorkingDays);
console.log('Meta mínima:', monthlyProgress.monthlyMin);
console.log('Meta alvo:', monthlyProgress.monthlyTarget);
console.log('Horas alvo atual:', monthlyProgress.targetHours);

// Se for janeiro, pode haver reset
if (currentDate.getDate() === 1) {
  console.log('\n⚠️ ATENÇÃO: Hoje é dia 1º do mês!');
  console.log('Pode haver reset das horas restantes.');
  console.log('Reset ativo:', monthlyProgress.isFirstDayReset);
}