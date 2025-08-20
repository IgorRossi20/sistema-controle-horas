// Script para testar a funcionalidade de relatórios
// Execute este script no console do navegador (F12) na página de relatórios

console.log('🔍 TESTANDO FUNCIONALIDADE DE RELATÓRIOS');
console.log('=' .repeat(50));

// Verificar se os serviços estão disponíveis
const checkServices = () => {
  console.log('\n📋 Verificando serviços disponíveis...');
  
  // Verificar se o Vue app está carregado
  if (typeof window.Vue !== 'undefined') {
    console.log('✅ Vue.js carregado');
  } else {
    console.log('❌ Vue.js não encontrado');
  }
  
  // Verificar se o Firebase está configurado
  if (typeof window.firebase !== 'undefined' || document.querySelector('script[src*="firebase"]')) {
    console.log('✅ Firebase detectado');
  } else {
    console.log('❌ Firebase não detectado');
  }
  
  // Verificar se estamos na página de relatórios
  const currentPath = window.location.pathname;
  console.log('📍 Página atual:', currentPath);
  
  if (currentPath.includes('reports') || currentPath.includes('relatorios')) {
    console.log('✅ Página de relatórios detectada');
  } else {
    console.log('⚠️ Não está na página de relatórios');
  }
};

// Verificar elementos da interface
const checkUI = () => {
  console.log('\n🎨 Verificando elementos da interface...');
  
  const generateBtn = document.querySelector('button[class*="btn-primary"]:not([class*="dropdown"])');
  if (generateBtn) {
    console.log('✅ Botão "Gerar Relatório" encontrado:', generateBtn.textContent.trim());
    console.log('   Habilitado:', !generateBtn.disabled);
  } else {
    console.log('❌ Botão "Gerar Relatório" não encontrado');
  }
  
  const monthSelect = document.querySelector('select[id*="month"], select[class*="form-select"]:first-of-type');
  if (monthSelect) {
    console.log('✅ Seletor de mês encontrado, valor:', monthSelect.value);
  } else {
    console.log('❌ Seletor de mês não encontrado');
  }
  
  const yearSelect = document.querySelector('select[id*="year"], select[class*="form-select"]:nth-of-type(2)');
  if (yearSelect) {
    console.log('✅ Seletor de ano encontrado, valor:', yearSelect.value);
  } else {
    console.log('❌ Seletor de ano não encontrado');
  }
  
  const reportArea = document.querySelector('.card-body');
  if (reportArea) {
    console.log('✅ Área de relatório encontrada');
    const hasData = reportArea.textContent.includes('Nenhum registro') || 
                   reportArea.textContent.includes('Selecione um mês');
    if (hasData) {
      console.log('📝 Status: Aguardando geração de relatório');
    }
  } else {
    console.log('❌ Área de relatório não encontrada');
  }
};

// Verificar dados no localStorage
const checkLocalData = () => {
  console.log('\n💾 Verificando dados locais...');
  
  const timeEntries = localStorage.getItem('timeEntries');
  if (timeEntries) {
    try {
      const entries = JSON.parse(timeEntries);
      console.log('✅ Entradas de tempo encontradas:', entries.length);
      
      if (entries.length > 0) {
        console.log('📊 Primeira entrada:', {
          data: entries[0].date,
          horas: entries[0].hours,
          projeto: entries[0].projectId,
          descricao: entries[0].description
        });
      }
    } catch (error) {
      console.log('❌ Erro ao parsear entradas de tempo:', error);
    }
  } else {
    console.log('⚠️ Nenhuma entrada de tempo no localStorage');
  }
  
  const projects = localStorage.getItem('projects');
  if (projects) {
    try {
      const projectList = JSON.parse(projects);
      console.log('✅ Projetos encontrados:', projectList.length);
    } catch (error) {
      console.log('❌ Erro ao parsear projetos:', error);
    }
  } else {
    console.log('⚠️ Nenhum projeto no localStorage');
  }
};

// Simular clique no botão de gerar relatório
const testReportGeneration = () => {
  console.log('\n🧪 Testando geração de relatório...');
  
  const generateBtn = document.querySelector('button[class*="btn-primary"]:not([class*="dropdown"])');
  const monthSelect = document.querySelector('select[id*="month"], select[class*="form-select"]:first-of-type');
  const yearSelect = document.querySelector('select[id*="year"], select[class*="form-select"]:nth-of-type(2)');
  
  if (!generateBtn || !monthSelect || !yearSelect) {
    console.log('❌ Elementos necessários não encontrados para teste');
    return;
  }
  
  // Definir valores padrão se não estiverem selecionados
  if (!monthSelect.value) {
    monthSelect.value = new Date().getMonth() + 1;
    monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('📅 Mês definido para:', monthSelect.value);
  }
  
  if (!yearSelect.value) {
    yearSelect.value = new Date().getFullYear();
    yearSelect.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('📅 Ano definido para:', yearSelect.value);
  }
  
  // Aguardar um pouco e tentar clicar
  setTimeout(() => {
    if (!generateBtn.disabled) {
      console.log('🔄 Clicando no botão "Gerar Relatório"...');
      generateBtn.click();
      
      // Verificar resultado após 2 segundos
      setTimeout(() => {
        const reportArea = document.querySelector('.card-body');
        if (reportArea) {
          const hasSpinner = reportArea.querySelector('.spinner-border');
          const hasData = reportArea.textContent.includes('Total de Horas');
          const hasNoData = reportArea.textContent.includes('Nenhum registro');
          
          if (hasSpinner) {
            console.log('⏳ Relatório sendo gerado...');
          } else if (hasData) {
            console.log('✅ Relatório gerado com sucesso!');
          } else if (hasNoData) {
            console.log('⚠️ Relatório gerado, mas sem dados para o período');
          } else {
            console.log('❓ Status do relatório indefinido');
          }
        }
      }, 2000);
    } else {
      console.log('❌ Botão está desabilitado');
    }
  }, 500);
};

// Executar todos os testes
const runAllTests = () => {
  checkServices();
  checkUI();
  checkLocalData();
  
  // Aguardar um pouco antes de testar a geração
  setTimeout(() => {
    testReportGeneration();
  }, 1000);
};

// Executar testes
runAllTests();

// Disponibilizar funções globalmente para uso manual
window.testReports = {
  checkServices,
  checkUI,
  checkLocalData,
  testReportGeneration,
  runAllTests
};

console.log('\n🛠️ COMANDOS DISPONÍVEIS:');
console.log('- testReports.checkServices() - Verificar serviços');
console.log('- testReports.checkUI() - Verificar interface');
console.log('- testReports.checkLocalData() - Verificar dados locais');
console.log('- testReports.testReportGeneration() - Testar geração');
console.log('- testReports.runAllTests() - Executar todos os testes');