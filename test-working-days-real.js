/**
 * Teste das funções reais do workingDays.js
 */

import { workingDaysService } from './src/services/workingDays.js';

console.log('=== TESTE DAS FUNÇÕES REAIS ===');

// Data atual: 12 de agosto de 2024
const currentDate = new Date(2024, 7, 12); // mês 7 = agosto
console.log('Data atual:', currentDate.toLocaleDateString('pt-BR'));

// Testar getRemainingWorkingDays
const remainingWorkingDays = workingDaysService.getRemainingWorkingDays(currentDate);
console.log('\n=== getRemainingWorkingDays ===');
console.log('Dias úteis restantes:', remainingWorkingDays);

// Testar getMonthlyProgress com valores reais
const hoursWorked = 1;
const timeEntries = []; // Vazio por enquanto
const monthlyProgress = workingDaysService.getMonthlyProgress(hoursWorked, currentDate, timeEntries);

console.log('\n=== getMonthlyProgress ===');
console.log('Horas trabalhadas:', monthlyProgress.hoursWorked);
console.log('Horas restantes:', monthlyProgress.remainingHours);
console.log('Média por dia útil:', monthlyProgress.averageHoursPerDay);
console.log('Dias úteis restantes (interno):', remainingWorkingDays);

// Verificar se há inconsistência
const expectedAverage = monthlyProgress.remainingHours / remainingWorkingDays;
console.log('\n=== Verificação ===');
console.log('Média esperada (manual):', expectedAverage.toFixed(2));
console.log('Média retornada:', monthlyProgress.averageHoursPerDay);

if (Math.abs(expectedAverage - monthlyProgress.averageHoursPerDay) > 0.01) {
  console.log('❌ INCONSISTÊNCIA ENCONTRADA!');
  console.log('A função getMonthlyProgress não está usando o mesmo cálculo.');
} else {
  console.log('✅ Cálculo consistente.');
}

// Testar outros valores do monthlyProgress
console.log('\n=== Outros valores do monthlyProgress ===');
console.log('Total de dias úteis no mês:', monthlyProgress.totalWorkingDays);
console.log('Dias trabalhados:', monthlyProgress.workedDays);
console.log('Dias restantes do mês:', monthlyProgress.remainingDays);
console.log('Meta mínima:', monthlyProgress.monthlyMin);
console.log('Meta alvo:', monthlyProgress.monthlyTarget);
console.log('Horas alvo:', monthlyProgress.targetHours);

// Verificar se o problema está na data
console.log('\n=== Verificação de Data ===');
console.log('Ano:', currentDate.getFullYear());
console.log('Mês (0-11):', currentDate.getMonth());
console.log('Dia:', currentDate.getDate());
console.log('Dia da semana:', currentDate.getDay(), '(0=Dom, 1=Seg, ...)');