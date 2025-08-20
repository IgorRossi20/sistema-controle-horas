/**
 * Script para debugar o Dashboard em tempo real
 * Vamos adicionar logs para ver o que está acontecendo
 */

// Vamos criar um script que pode ser executado no console do navegador
const debugScript = `
// === DEBUG DO DASHBOARD ===
console.log('=== DEBUGGING DASHBOARD MÉDIA ===');

// Verificar a data atual
const now = new Date();
console.log('Data atual do navegador:', now.toLocaleDateString('pt-BR'));
console.log('Ano:', now.getFullYear());
console.log('Mês (0-11):', now.getMonth());
console.log('Dia:', now.getDate());

// Verificar se há alguma variável global do Vue
if (window.Vue || window.__VUE__) {
  console.log('Vue detectado no navegador');
}

// Tentar acessar o workingDaysService
if (window.workingDaysService) {
  console.log('workingDaysService encontrado');
  const remainingDays = window.workingDaysService.getRemainingWorkingDays(now);
  console.log('Dias úteis restantes:', remainingDays);
} else {
  console.log('workingDaysService não encontrado no window');
}

// Verificar localStorage para dados de horas
const timeEntries = localStorage.getItem('timeEntries');
if (timeEntries) {
  try {
    const entries = JSON.parse(timeEntries);
    console.log('Entradas de tempo no localStorage:', entries.length);
    
    // Filtrar entradas do mês atual
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    console.log('Entradas do mês atual:', currentMonthEntries.length);
    
    const totalHours = currentMonthEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);
    console.log('Total de horas do mês:', totalHours);
    
  } catch (error) {
    console.error('Erro ao processar timeEntries:', error);
  }
} else {
  console.log('Nenhuma entrada de tempo encontrada no localStorage');
}

// Verificar se há algum elemento com a média no DOM
const mediaElements = document.querySelectorAll('*');
for (let element of mediaElements) {
  if (element.textContent && element.textContent.includes('22.38')) {
    console.log('Elemento com 22.38 encontrado:', element);
    console.log('Texto completo:', element.textContent);
    console.log('Classes:', element.className);
  }
}

console.log('=== FIM DO DEBUG ===');
`;

console.log('=== SCRIPT PARA EXECUTAR NO CONSOLE DO NAVEGADOR ===');
console.log('Copie e cole o código abaixo no console do navegador (F12):');
console.log('');
console.log(debugScript);
console.log('');
console.log('=== INSTRUÇÕES ===');
console.log('1. Abra o navegador com a aplicação');
console.log('2. Pressione F12 para abrir o DevTools');
console.log('3. Vá para a aba Console');
console.log('4. Cole o código acima e pressione Enter');
console.log('5. Analise os resultados para identificar o problema');