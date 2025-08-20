/**
 * Script para investigar o problema na média de 22.38
 * Vamos simular exatamente o que está acontecendo no código
 */

// Vamos testar com diferentes cenários para encontrar o problema
console.log('=== INVESTIGANDO O PROBLEMA DA MÉDIA 22.38 ===');

// Cenário 1: Se a média é 22.38 com 179 horas restantes
const hoursRemaining = 179;
const averageShown = 22.38;

// Calcular quantos dias úteis resultariam nessa média
const daysForThisAverage = hoursRemaining / averageShown;
console.log('\n=== Cenário 1: Reverse Engineering ===');
console.log('Horas restantes:', hoursRemaining);
console.log('Média mostrada:', averageShown);
console.log('Dias úteis que resultariam nessa média:', daysForThisAverage.toFixed(2));

// Cenário 2: Verificar se está contando apenas metade dos dias
const correctDays = 15; // Calculado anteriormente
const halfDays = correctDays / 2;
console.log('\n=== Cenário 2: Problema de Contagem ===');
console.log('Dias úteis corretos:', correctDays);
console.log('Metade dos dias:', halfDays);
console.log('Média com metade dos dias:', (hoursRemaining / halfDays).toFixed(2));

// Cenário 3: Verificar se há problema com inclusão/exclusão do dia atual
const daysExcludingToday = 14; // 15 - 1 (excluindo hoje)
console.log('\n=== Cenário 3: Excluindo Dia Atual ===');
console.log('Dias úteis excluindo hoje:', daysExcludingToday);
console.log('Média excluindo hoje:', (hoursRemaining / daysExcludingToday).toFixed(2));

// Cenário 4: Verificar se há problema com o cálculo de horas restantes
const possibleRemainingHours = averageShown * correctDays;
console.log('\n=== Cenário 4: Problema nas Horas Restantes ===');
console.log('Se a média fosse correta (22.38) com 15 dias:');
console.log('Horas restantes deveriam ser:', possibleRemainingHours.toFixed(2));
console.log('Diferença das horas mostradas:', (possibleRemainingHours - hoursRemaining).toFixed(2));

// Cenário 5: Verificar se há problema com dias úteis de agosto
const augustWorkingDays = 22; // Total de dias úteis em agosto 2024
const workedDays = 1; // Apenas 1 dia trabalhado até agora
const remainingDaysInMonth = augustWorkingDays - workedDays;
console.log('\n=== Cenário 5: Cálculo Baseado no Mês Todo ===');
console.log('Total de dias úteis em agosto:', augustWorkingDays);
console.log('Dias já trabalhados:', workedDays);
console.log('Dias úteis restantes no mês:', remainingDaysInMonth);
console.log('Média com dias restantes do mês:', (hoursRemaining / remainingDaysInMonth).toFixed(2));

// Cenário 6: Verificar se está usando dias corridos ao invés de úteis
const currentDate = new Date(2024, 7, 12); // 12 de agosto
const lastDay = new Date(2024, 7, 31); // 31 de agosto
const remainingCalendarDays = Math.ceil((lastDay - currentDate) / (1000 * 60 * 60 * 24));
console.log('\n=== Cenário 6: Dias Corridos ===');
console.log('Dias corridos restantes:', remainingCalendarDays);
console.log('Média com dias corridos:', (hoursRemaining / remainingCalendarDays).toFixed(2));

// Conclusão
console.log('\n=== CONCLUSÃO ===');
if (Math.abs(daysForThisAverage - 8) < 0.1) {
  console.log('🔍 PROBLEMA ENCONTRADO: O código está usando aproximadamente 8 dias ao invés de 15!');
  console.log('Isso sugere que há um bug na função getRemainingWorkingDays.');
} else if (Math.abs((hoursRemaining / halfDays) - averageShown) < 0.1) {
  console.log('🔍 PROBLEMA ENCONTRADO: O código está contando metade dos dias úteis!');
} else {
  console.log('🤔 O problema não foi identificado com os cenários testados.');
  console.log('É necessário investigar mais o código.');
}