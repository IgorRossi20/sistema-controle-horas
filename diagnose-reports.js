// Script de diagnóstico completo para relatórios
// Execute este script no console do navegador (F12) na página de relatórios

console.log('🔍 DIAGNÓSTICO COMPLETO DE RELATÓRIOS');
console.log('=' .repeat(60));

// Função para verificar o estado atual da aplicação
const checkAppState = () => {
  console.log('\n📱 Verificando estado da aplicação...');
  
  // Verificar Vue app
  const vueApp = document.querySelector('#app').__vue__;
  if (vueApp) {
    console.log('✅ Vue app encontrado');
    
    // Verificar store do usuário
    const userStore = vueApp.$pinia._s.get('user');
    if (userStore) {
      console.log('✅ User store encontrado');
      console.log('👤 UserId:', userStore.userId);
      console.log('📧 Email:', userStore.userEmail);
      console.log('👤 Nome:', userStore.userName);
    } else {
      console.log('❌ User store não encontrado');
    }
    
    // Verificar se estamos na página de relatórios
    const currentRoute = vueApp.$route;
    if (currentRoute) {
      console.log('🛣️ Rota atual:', currentRoute.path);
      console.log('📄 Nome da rota:', currentRoute.name);
    }
    
  } else {
    console.log('❌ Vue app não encontrado');
  }
};

// Função para verificar serviços disponíveis
const checkServices = () => {
  console.log('\n🔧 Verificando serviços...');
  
  // Verificar timeEntriesService
  if (window.timeEntriesService) {
    console.log('✅ timeEntriesService disponível globalmente');
    
    if (typeof window.timeEntriesService.getTimeEntriesByPeriod === 'function') {
      console.log('✅ Função getTimeEntriesByPeriod disponível');
    } else {
      console.log('❌ Função getTimeEntriesByPeriod não encontrada');
    }
  } else {
    console.log('❌ timeEntriesService não disponível globalmente');
    
    // Tentar acessar através do Vue
    try {
      const vueApp = document.querySelector('#app').__vue__;
      if (vueApp && vueApp.$timeEntriesService) {
        console.log('✅ timeEntriesService encontrado no Vue');
      } else {
        console.log('❌ timeEntriesService não encontrado no Vue');
      }
    } catch (error) {
      console.log('❌ Erro ao acessar serviços via Vue:', error.message);
    }
  }
  
  // Verificar Firebase
  if (window.firebase || window.db) {
    console.log('✅ Firebase disponível');
  } else {
    console.log('❌ Firebase não disponível globalmente');
  }
};

// Função para testar a busca de dados diretamente
const testDirectDataFetch = async () => {
  console.log('\n🔍 Testando busca direta de dados...');
  
  try {
    // Importar Firebase dinamicamente
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, where, orderBy } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    // Configuração do Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyDRz7RfzKa7unVyy3QHPKXCauPH_4kWbME",
      authDomain: "controlehoras-1d95d.firebaseapp.com",
      projectId: "controlehoras-1d95d",
      storageBucket: "controlehoras-1d95d.firebasestorage.app",
      messagingSenderId: "67121306586",
      appId: "1:67121306586:web:bd6d77fdc4b127e7ecbee3",
      measurementId: "G-7K8C53E9KG"
    };
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const userId = 'default-user';
    
    console.log('🔍 Buscando dados para userId:', userId);
    
    // Buscar projetos
    const projectsQuery = query(collection(db, 'projects'), where('userId', '==', userId));
    const projectsSnapshot = await getDocs(projectsQuery);
    console.log('📁 Projetos encontrados:', projectsSnapshot.size);
    
    // Buscar todas as entradas de tempo
    const entriesQuery = query(
      collection(db, 'timeEntries'), 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const entriesSnapshot = await getDocs(entriesQuery);
    console.log('⏰ Total de entradas encontradas:', entriesSnapshot.size);
    
    if (entriesSnapshot.size > 0) {
      console.log('\n📊 Detalhes das entradas:');
      entriesSnapshot.forEach((doc, index) => {
        const data = doc.data();
        let date;
        
        if (data.date && data.date.seconds) {
          date = new Date(data.date.seconds * 1000);
        } else if (data.date instanceof Date) {
          date = data.date;
        } else {
          date = new Date(data.date);
        }
        
        console.log(`   ${index + 1}. ${data.description} - ${data.hours}h - ${date.toLocaleDateString('pt-BR')}`);
      });
    }
    
    // Testar busca por período (mês atual)
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    console.log('\n📅 Testando busca por período:');
    console.log('   Início:', startDate.toLocaleDateString('pt-BR'));
    console.log('   Fim:', endDate.toLocaleDateString('pt-BR'));
    
    const periodQuery = query(
      collection(db, 'timeEntries'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const periodSnapshot = await getDocs(periodQuery);
    console.log('📊 Entradas no período:', periodSnapshot.size);
    
    if (periodSnapshot.size > 0) {
      let totalHours = 0;
      periodSnapshot.forEach((doc) => {
        const data = doc.data();
        const hours = parseFloat(data.hours.toString().replace(',', '.'));
        totalHours += hours;
      });
      console.log('⏱️ Total de horas no período:', totalHours.toFixed(2) + 'h');
    }
    
    return {
      projects: projectsSnapshot.size,
      totalEntries: entriesSnapshot.size,
      periodEntries: periodSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Erro na busca direta:', error);
    return null;
  }
};

// Função para simular a geração de relatório
const simulateReportGeneration = async () => {
  console.log('\n🎯 Simulando geração de relatório...');
  
  try {
    // Verificar se estamos na página correta
    const currentPath = window.location.pathname;
    if (!currentPath.includes('reports') && !currentPath.includes('relatorios')) {
      console.log('⚠️ Não estamos na página de relatórios');
      console.log('💡 Navegue para /reports primeiro');
      return;
    }
    
    // Encontrar elementos da interface
    const monthSelect = document.querySelector('select[id*="month"], select:first-of-type');
    const yearSelect = document.querySelector('select[id*="year"], select:nth-of-type(2)');
    const generateBtn = document.querySelector('button:contains("Gerar"), button[class*="btn-primary"]:not([class*="dropdown"])');
    
    console.log('🔍 Elementos encontrados:');
    console.log('   Seletor de mês:', !!monthSelect);
    console.log('   Seletor de ano:', !!yearSelect);
    console.log('   Botão gerar:', !!generateBtn);
    
    if (!monthSelect || !yearSelect || !generateBtn) {
      console.log('❌ Alguns elementos não foram encontrados');
      
      // Listar todos os selects e botões disponíveis
      const allSelects = document.querySelectorAll('select');
      const allButtons = document.querySelectorAll('button');
      
      console.log('\n📋 Selects disponíveis:');
      allSelects.forEach((select, index) => {
        console.log(`   ${index + 1}. ID: ${select.id}, Classes: ${select.className}`);
      });
      
      console.log('\n🔘 Botões disponíveis:');
      allButtons.forEach((button, index) => {
        console.log(`   ${index + 1}. Texto: "${button.textContent.trim()}", Classes: ${button.className}`);
      });
      
      return;
    }
    
    // Configurar valores
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    if (monthSelect) {
      monthSelect.value = currentMonth;
      monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (yearSelect) {
      yearSelect.value = currentYear;
      yearSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    console.log(`📅 Configurado para: ${currentMonth}/${currentYear}`);
    
    // Aguardar um pouco e clicar no botão
    setTimeout(() => {
      if (generateBtn && !generateBtn.disabled) {
        console.log('🔄 Clicando em "Gerar Relatório"...');
        generateBtn.click();
        
        // Monitorar resultado
        setTimeout(() => {
          checkReportResult();
        }, 3000);
      } else {
        console.log('❌ Botão não disponível ou desabilitado');
        if (generateBtn) {
          console.log('   Desabilitado:', generateBtn.disabled);
          console.log('   Classes:', generateBtn.className);
        }
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
  }
};

// Função para verificar o resultado do relatório
const checkReportResult = () => {
  console.log('\n📊 Verificando resultado do relatório...');
  
  try {
    // Procurar área de resultados
    const reportArea = document.querySelector('.card-body, .report-content, [class*="report"]');
    
    if (reportArea) {
      const content = reportArea.textContent;
      
      // Verificar diferentes estados
      const hasLoading = content.includes('Carregando') || reportArea.querySelector('.spinner-border, .loading');
      const hasData = content.includes('Total de Horas') || content.includes('Projeto') || content.includes('horas');
      const hasNoData = content.includes('Nenhum registro') || content.includes('não encontrado');
      const hasError = content.includes('erro') || content.includes('Erro');
      
      console.log('📋 Estado do relatório:');
      console.log('   Carregando:', !!hasLoading);
      console.log('   Tem dados:', !!hasData);
      console.log('   Sem dados:', !!hasNoData);
      console.log('   Tem erro:', !!hasError);
      
      if (hasData) {
        console.log('✅ Relatório gerado com sucesso!');
        
        // Tentar extrair informações específicas
        const hoursMatch = content.match(/(\d+[.,]\d+)\s*h/);
        if (hoursMatch) {
          console.log('⏱️ Horas encontradas:', hoursMatch[1]);
        }
      } else if (hasNoData) {
        console.log('⚠️ Relatório sem dados para o período');
      } else if (hasError) {
        console.log('❌ Erro na geração do relatório');
      } else if (hasLoading) {
        console.log('⏳ Relatório ainda carregando...');
      } else {
        console.log('❓ Estado indefinido');
      }
      
      // Mostrar uma amostra do conteúdo
      console.log('\n📝 Amostra do conteúdo:');
      console.log(content.substring(0, 300) + (content.length > 300 ? '...' : ''));
      
    } else {
      console.log('❌ Área de relatório não encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar resultado:', error);
  }
};

// Função principal de diagnóstico
const runDiagnosis = async () => {
  console.log('🚀 Iniciando diagnóstico completo...');
  
  try {
    // 1. Verificar estado da aplicação
    checkAppState();
    
    // 2. Verificar serviços
    checkServices();
    
    // 3. Testar busca direta de dados
    const dataResult = await testDirectDataFetch();
    
    // 4. Simular geração de relatório se estivermos na página correta
    await simulateReportGeneration();
    
    console.log('\n🏁 Diagnóstico concluído!');
    
    if (dataResult) {
      console.log('\n📊 RESUMO DOS DADOS:');
      console.log(`   Projetos: ${dataResult.projects}`);
      console.log(`   Total de entradas: ${dataResult.totalEntries}`);
      console.log(`   Entradas no período atual: ${dataResult.periodEntries}`);
      
      if (dataResult.totalEntries === 0) {
        console.log('\n💡 SOLUÇÃO SUGERIDA:');
        console.log('   Execute o script fix-reports-data.js para criar dados de teste');
      } else if (dataResult.periodEntries === 0) {
        console.log('\n💡 SOLUÇÃO SUGERIDA:');
        console.log('   As entradas existem, mas não para o período atual');
        console.log('   Verifique as datas ou selecione um período diferente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
};

// Disponibilizar funções globalmente
window.reportsDiagnosis = {
  runDiagnosis,
  checkAppState,
  checkServices,
  testDirectDataFetch,
  simulateReportGeneration,
  checkReportResult
};

// Executar diagnóstico automaticamente
runDiagnosis();

console.log('\n🛠️ COMANDOS DISPONÍVEIS:');
console.log('- reportsDiagnosis.runDiagnosis() - Executar diagnóstico completo');
console.log('- reportsDiagnosis.checkAppState() - Verificar estado da app');
console.log('- reportsDiagnosis.testDirectDataFetch() - Testar busca de dados');
console.log('- reportsDiagnosis.simulateReportGeneration() - Simular geração');