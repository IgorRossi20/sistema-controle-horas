// Script para debugar problemas com relatórios no Firebase
// Execute este script no console do navegador (F12)

console.log('🔥 DEBUGANDO RELATÓRIOS FIREBASE');
console.log('=' .repeat(50));

// Verificar se o Firebase está configurado
const checkFirebaseConfig = () => {
  console.log('\n🔧 Verificando configuração do Firebase...');
  
  // Verificar se o Firebase foi importado
  const firebaseScripts = document.querySelectorAll('script[src*="firebase"]');
  console.log('📦 Scripts Firebase encontrados:', firebaseScripts.length);
  
  // Verificar se há configuração no código
  try {
    // Tentar acessar o objeto de configuração do Firebase
    if (window.firebase) {
      console.log('✅ Firebase global disponível');
    } else {
      console.log('❌ Firebase global não encontrado');
    }
    
    // Verificar se há erros de autenticação
    const authErrors = [];
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('firebase') || message.includes('auth') || message.includes('firestore')) {
        authErrors.push(message);
      }
      originalError.apply(console, args);
    };
    
  } catch (error) {
    console.log('❌ Erro ao verificar Firebase:', error);
  }
};

// Simular dados de teste para relatórios
const createTestData = () => {
  console.log('\n🧪 Criando dados de teste...');
  
  const testTimeEntries = [
    {
      id: 'test1',
      userId: 'user123',
      projectId: 'proj1',
      description: 'Desenvolvimento de funcionalidade',
      hours: '8.00',
      date: new Date('2025-01-15'),
      createdAt: new Date()
    },
    {
      id: 'test2',
      userId: 'user123',
      projectId: 'proj2',
      description: 'Reunião de planejamento',
      hours: '2.30',
      date: new Date('2025-01-16'),
      createdAt: new Date()
    },
    {
      id: 'test3',
      userId: 'user123',
      projectId: 'proj1',
      description: 'Testes e correções',
      hours: '4.15',
      date: new Date('2025-01-17'),
      createdAt: new Date()
    }
  ];
  
  const testProjects = [
    {
      id: 'proj1',
      name: 'Projeto A',
      description: 'Desenvolvimento de sistema',
      userId: 'user123'
    },
    {
      id: 'proj2',
      name: 'Projeto B',
      description: 'Consultoria técnica',
      userId: 'user123'
    }
  ];
  
  // Salvar no localStorage como fallback
  localStorage.setItem('testTimeEntries', JSON.stringify(testTimeEntries));
  localStorage.setItem('testProjects', JSON.stringify(testProjects));
  
  console.log('✅ Dados de teste criados:');
  console.log('   - Entradas de tempo:', testTimeEntries.length);
  console.log('   - Projetos:', testProjects.length);
  
  return { testTimeEntries, testProjects };
};

// Testar função de busca por período
const testPeriodSearch = async () => {
  console.log('\n🔍 Testando busca por período...');
  
  try {
    // Verificar se a função existe no escopo global
    if (typeof window.timeEntriesService !== 'undefined') {
      console.log('✅ timeEntriesService encontrado');
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      console.log('📅 Buscando entradas de', startDate.toLocaleDateString(), 'até', endDate.toLocaleDateString());
      
      const entries = await window.timeEntriesService.getTimeEntriesByPeriod('user123', startDate, endDate);
      console.log('📊 Entradas encontradas:', entries.length);
      
      if (entries.length > 0) {
        console.log('📝 Primeira entrada:', entries[0]);
      }
      
    } else {
      console.log('❌ timeEntriesService não encontrado no escopo global');
      
      // Tentar acessar através do Vue app
      const vueApp = document.querySelector('#app').__vue__;
      if (vueApp) {
        console.log('🔍 Tentando acessar através do Vue app...');
        // Implementar acesso através do Vue se necessário
      }
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar busca por período:', error);
  }
};

// Verificar estado atual da página de relatórios
const checkReportsPage = () => {
  console.log('\n📊 Verificando página de relatórios...');
  
  const url = window.location.href;
  console.log('🌐 URL atual:', url);
  
  // Verificar se estamos na página correta
  if (!url.includes('reports') && !url.includes('relatorios')) {
    console.log('⚠️ Não está na página de relatórios');
    console.log('💡 Navegue para a página de relatórios primeiro');
    return false;
  }
  
  // Verificar elementos da interface
  const generateBtn = document.querySelector('button');
  const selects = document.querySelectorAll('select');
  const cards = document.querySelectorAll('.card');
  
  console.log('🎛️ Elementos encontrados:');
  console.log('   - Botões:', document.querySelectorAll('button').length);
  console.log('   - Selects:', selects.length);
  console.log('   - Cards:', cards.length);
  
  // Verificar se há erros visíveis
  const errorElements = document.querySelectorAll('.alert-danger, .text-danger, .error');
  if (errorElements.length > 0) {
    console.log('❌ Erros visíveis na página:', errorElements.length);
    errorElements.forEach((el, i) => {
      console.log(`   ${i + 1}. ${el.textContent.trim()}`);
    });
  } else {
    console.log('✅ Nenhum erro visível na página');
  }
  
  return true;
};

// Verificar console do navegador por erros
const checkConsoleErrors = () => {
  console.log('\n🚨 Monitorando erros do console...');
  
  const errors = [];
  const warnings = [];
  
  // Interceptar console.error
  const originalError = console.error;
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Interceptar console.warn
  const originalWarn = console.warn;
  console.warn = function(...args) {
    warnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };
  
  // Listener para erros não capturados
  window.addEventListener('error', (event) => {
    errors.push(`Erro não capturado: ${event.message} em ${event.filename}:${event.lineno}`);
  });
  
  // Verificar após 3 segundos
  setTimeout(() => {
    console.log('\n📋 Relatório de erros:');
    console.log('❌ Erros:', errors.length);
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    
    console.log('⚠️ Warnings:', warnings.length);
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Nenhum erro ou warning detectado');
    }
  }, 3000);
};

// Executar todos os testes
const runDiagnostics = async () => {
  checkFirebaseConfig();
  createTestData();
  
  if (checkReportsPage()) {
    await testPeriodSearch();
  }
  
  checkConsoleErrors();
  
  console.log('\n🏁 Diagnóstico concluído!');
  console.log('💡 Se ainda houver problemas, verifique:');
  console.log('   1. Configuração do Firebase');
  console.log('   2. Autenticação do usuário');
  console.log('   3. Permissões do Firestore');
  console.log('   4. Dados de teste no banco');
};

// Disponibilizar funções globalmente
window.debugReports = {
  checkFirebaseConfig,
  createTestData,
  testPeriodSearch,
  checkReportsPage,
  checkConsoleErrors,
  runDiagnostics
};

// Executar diagnóstico automaticamente
runDiagnostics();

console.log('\n🛠️ COMANDOS DISPONÍVEIS:');
console.log('- debugReports.runDiagnostics() - Executar diagnóstico completo');
console.log('- debugReports.createTestData() - Criar dados de teste');
console.log('- debugReports.testPeriodSearch() - Testar busca por período');