/**
 * Script para debugar o cálculo da média por dia útil de agosto
 */

// Simular os valores que estão sendo mostrados no dashboard
const hoursWorked = 1; // 1 hora trabalhada (conforme mostrado na imagem)
const remainingHours = 179; // 179 horas restantes (conforme mostrado na imagem)
const currentDate = new Date(2024, 7, 12); // 12 de agosto de 2024 (mês 7 = agosto)

console.log('=== DEBUG: Cálculo da Média por Dia Útil ===');
console.log('Data atual:', currentDate.toLocaleDateString('pt-BR'));
console.log('Horas trabalhadas:', hoursWorked);
console.log('Horas restantes:', remainingHours);

// Função para verificar se é dia útil (copiada do workingDays.js)
function isWeekend(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Domingo ou Sábado
}

function isHoliday(date) {
  // Feriados fixos brasileiros
  const FIXED_HOLIDAYS = {
    '01-01': 'Confraternização Universal',
    '04-21': 'Tiradentes',
    '05-01': 'Dia do Trabalhador',
    '09-07': 'Independência do Brasil',
    '10-12': 'Nossa Senhora Aparecida',
    '11-02': 'Finados',
    '11-15': 'Proclamação da República',
    '12-25': 'Natal'
  };
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${month}-${day}`;
  
  return FIXED_HOLIDAYS[dateStr] !== undefined;
}

function isWorkingDay(date) {
  return !isWeekend(date) && !isHoliday(date);
}

// Calcular dias úteis restantes em agosto de 2024
function getRemainingWorkingDays(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const lastDay = new Date(year, month + 1, 0); // Último dia do mês
  let remainingDays = 0;
  
  console.log('\n=== Calculando dias úteis restantes ===');
  console.log('Último dia do mês:', lastDay.toLocaleDateString('pt-BR'));
  
  for (let date = new Date(currentDate); date <= lastDay; date.setDate(date.getDate() + 1)) {
    if (isWorkingDay(date)) {
      remainingDays++;
      console.log(`Dia útil: ${date.toLocaleDateString('pt-BR')} (${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()]})`);
    } else {
      console.log(`Não útil: ${date.toLocaleDateString('pt-BR')} (${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()]})`);
    }
  }
  
  return remainingDays;
}

const remainingWorkingDays = getRemainingWorkingDays(currentDate);
console.log('\n=== Resultado ===');
console.log('Dias úteis restantes:', remainingWorkingDays);

// Calcular a média
const averageHoursPerWorkingDay = remainingWorkingDays > 0 ? remainingHours / remainingWorkingDays : 0;
console.log('Média por dia útil:', averageHoursPerWorkingDay);
console.log('Média arredondada:', Math.round(averageHoursPerWorkingDay * 100) / 100);

// Verificar se o cálculo está correto
if (Math.round(averageHoursPerWorkingDay * 100) / 100 === 22.38) {
  console.log('\n✅ O cálculo está correto!');
  console.log(`179 horas ÷ ${remainingWorkingDays} dias úteis = ${averageHoursPerWorkingDay.toFixed(2)} horas/dia`);
} else {
  console.log('\n❌ Há uma discrepância no cálculo.');
  console.log('Valor esperado: 22.38');
  console.log('Valor calculado:', Math.round(averageHoursPerWorkingDay * 100) / 100);
}

console.log('\n=== Análise ===');
console.log('Se você tem 179 horas restantes para trabalhar e', remainingWorkingDays, 'dias úteis restantes,');
console.log('você precisa trabalhar em média', Math.round(averageHoursPerWorkingDay * 100) / 100, 'horas por dia útil.');
console.log('\nIsso é aproximadamente', Math.floor(averageHoursPerWorkingDay), 'horas e', Math.round((averageHoursPerWorkingDay % 1) * 60), 'minutos por dia útil.');