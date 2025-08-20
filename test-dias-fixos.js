// Teste da nova implementação com dias úteis fixos

// Simular o cálculo com dias fixos
const fixedWorkingDaysByMonth = {
  0: 22,  // Janeiro
  1: 20,  // Fevereiro
  2: 23,  // Março
  3: 22,  // Abril
  4: 22,  // Maio
  5: 21,  // Junho
  6: 23,  // Julho
  7: 21,  // Agosto
  8: 22,  // Setembro
  9: 23,  // Outubro
  10: 21, // Novembro
  11: 21  // Dezembro
}

const MONTHLY_MIN = 180
const MONTHLY_TARGET = 200

// Teste para agosto (mês 7)
const agostoMonth = 7
const julhoMonth = 6
const hoursWorked = 1

// Calcular target hours
let targetHours = MONTHLY_TARGET
if (hoursWorked < MONTHLY_MIN) {
  targetHours = MONTHLY_MIN
}

// Cálculo para agosto
const agostoDiasFixos = fixedWorkingDaysByMonth[agostoMonth]
const agostoMedia = targetHours / agostoDiasFixos

// Cálculo para julho
const julhoDiasFixos = fixedWorkingDaysByMonth[julhoMonth]
const julhoMedia = targetHours / julhoDiasFixos

console.log('=== TESTE COM DIAS ÚTEIS FIXOS ===');
console.log('');
console.log('AGOSTO:');
console.log(`- Dias úteis fixos: ${agostoDiasFixos}`);
console.log(`- Target hours: ${targetHours}`);
console.log(`- Média por dia útil: ${agostoMedia.toFixed(2)}`);
console.log('');
console.log('JULHO:');
console.log(`- Dias úteis fixos: ${julhoDiasFixos}`);
console.log(`- Target hours: ${targetHours}`);
console.log(`- Média por dia útil: ${julhoMedia.toFixed(2)}`);
console.log('');
console.log('COMPARAÇÃO:');
console.log(`- Agosto: ${agostoMedia.toFixed(2)}h/dia (${agostoDiasFixos} dias)`);
console.log(`- Julho: ${julhoMedia.toFixed(2)}h/dia (${julhoDiasFixos} dias)`);
console.log('');
console.log('Todos os meses:');
Object.entries(fixedWorkingDaysByMonth).forEach(([monthIndex, days]) => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const media = targetHours / days
  console.log(`- ${monthNames[monthIndex]}: ${media.toFixed(2)}h/dia (${days} dias)`);
});