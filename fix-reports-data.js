// Script para corrigir dados e testar relatórios
// Execute este script no console do navegador (F12)

console.log('🔧 CORRIGINDO DADOS PARA RELATÓRIOS');
console.log('=' .repeat(50));

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

// Função para criar dados de teste com o userId correto
const createCorrectTestData = async () => {
  console.log('\n🧪 Criando dados de teste com userId correto...');
  
  try {
    // Importar Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    const { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const userId = 'default-user'; // Usar o mesmo userId da configuração
    
    console.log('👤 Usando userId:', userId);
    
    // Verificar se já existem projetos para este usuário
    const existingProjectsQuery = query(collection(db, 'projects'), where('userId', '==', userId));
    const existingProjects = await getDocs(existingProjectsQuery);
    
    let projectId;
    
    if (existingProjects.size > 0) {
      // Usar projeto existente
      const firstProject = existingProjects.docs[0];
      projectId = firstProject.id;
      console.log('✅ Usando projeto existente:', firstProject.data().name);
    } else {
      // Criar novo projeto
      const projectData = {
        name: 'Projeto Principal',
        description: 'Projeto para controle de horas',
        userId: userId,
        createdAt: serverTimestamp()
      };
      
      const projectRef = await addDoc(collection(db, 'projects'), projectData);
      projectId = projectRef.id;
      console.log('✅ Projeto criado:', projectId);
    }
    
    // Verificar se já existem entradas de tempo para este usuário
    const existingEntriesQuery = query(collection(db, 'timeEntries'), where('userId', '==', userId));
    const existingEntries = await getDocs(existingEntriesQuery);
    
    if (existingEntries.size > 0) {
      console.log('✅ Já existem', existingEntries.size, 'entradas de tempo para este usuário');
    } else {
      // Criar entradas de tempo para o mês atual
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const timeEntries = [
        {
          userId: userId,
          projectId: projectId,
          description: 'Desenvolvimento de funcionalidades',
          hours: '8.00',
          date: new Date(currentYear, currentMonth, 15),
          createdAt: serverTimestamp()
        },
        {
          userId: userId,
          projectId: projectId,
          description: 'Reunião de planejamento',
          hours: '2.30',
          date: new Date(currentYear, currentMonth, 16),
          createdAt: serverTimestamp()
        },
        {
          userId: userId,
          projectId: projectId,
          description: 'Testes e correções',
          hours: '4.15',
          date: new Date(currentYear, currentMonth, 17),
          createdAt: serverTimestamp()
        },
        {
          userId: userId,
          projectId: projectId,
          description: 'Documentação',
          hours: '3.45',
          date: new Date(currentYear, currentMonth, 18),
          createdAt: serverTimestamp()
        },
        {
          userId: userId,
          projectId: projectId,
          description: 'Code review',
          hours: '1.30',
          date: new Date(currentYear, currentMonth, 19),
          createdAt: serverTimestamp()
        }
      ];
      
      console.log('📅 Criando entradas para', currentMonth + 1, '/', currentYear);
      
      for (const entry of timeEntries) {
        const entryRef = await addDoc(collection(db, 'timeEntries'), entry);
        console.log('✅ Entrada criada:', entry.description, '-', entry.hours + 'h');
      }
    }
    
    console.log('🎉 Dados de teste configurados com sucesso!');
    return { userId, projectId };
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
    throw error;
  }
};

// Função para testar a geração de relatórios
const testReportGeneration = async () => {
  console.log('\n📊 Testando geração de relatórios...');
  
  try {
    // Aguardar um pouco para garantir que os dados foram salvos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se estamos na página de relatórios
    const currentPath = window.location.pathname;
    if (!currentPath.includes('reports') && !currentPath.includes('relatorios')) {
      console.log('⚠️ Navegue para a página de relatórios primeiro');
      console.log('💡 URL sugerida: /reports');
      return;
    }
    
    // Encontrar e configurar os seletores
    const monthSelect = document.querySelector('select');
    const yearSelect = document.querySelectorAll('select')[1];
    const generateBtn = document.querySelector('button[class*="btn-primary"]:not([class*="dropdown"])');
    
    if (!monthSelect || !yearSelect || !generateBtn) {
      console.log('❌ Elementos da interface não encontrados');
      console.log('   Mês:', !!monthSelect);
      console.log('   Ano:', !!yearSelect);
      console.log('   Botão:', !!generateBtn);
      return;
    }
    
    // Configurar mês e ano atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;
    
    // Disparar eventos de mudança
    monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
    yearSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('📅 Configurado para:', currentMonth + '/' + currentYear);
    
    // Aguardar um pouco e clicar no botão
    setTimeout(() => {
      if (!generateBtn.disabled) {
        console.log('🔄 Clicando em "Gerar Relatório"...');
        generateBtn.click();
        
        // Verificar resultado após 3 segundos
        setTimeout(() => {
          const reportArea = document.querySelector('.card-body');
          if (reportArea) {
            const hasSpinner = reportArea.querySelector('.spinner-border');
            const hasData = reportArea.textContent.includes('Total de Horas') || 
                           reportArea.textContent.includes('Projeto');
            const hasNoData = reportArea.textContent.includes('Nenhum registro');
            
            if (hasSpinner) {
              console.log('⏳ Relatório ainda sendo gerado...');
            } else if (hasData) {
              console.log('✅ Relatório gerado com sucesso!');
              console.log('📊 Dados encontrados na interface');
            } else if (hasNoData) {
              console.log('⚠️ Relatório gerado, mas sem dados para o período');
              console.log('💡 Verifique se as datas das entradas estão corretas');
            } else {
              console.log('❓ Status do relatório indefinido');
              console.log('📝 Conteúdo da área:', reportArea.textContent.substring(0, 200));
            }
          }
        }, 3000);
      } else {
        console.log('❌ Botão "Gerar Relatório" está desabilitado');
        console.log('💡 Verifique se mês e ano estão selecionados');
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro ao testar geração de relatórios:', error);
  }
};

// Função para verificar dados existentes
const checkExistingData = async () => {
  console.log('\n🔍 Verificando dados existentes...');
  
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    const { getFirestore, collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const userId = 'default-user';
    
    // Verificar projetos
    const projectsQuery = query(collection(db, 'projects'), where('userId', '==', userId));
    const projectsSnapshot = await getDocs(projectsQuery);
    console.log('📁 Projetos encontrados:', projectsSnapshot.size);
    
    // Verificar entradas de tempo
    const entriesQuery = query(collection(db, 'timeEntries'), where('userId', '==', userId));
    const entriesSnapshot = await getDocs(entriesQuery);
    console.log('⏰ Entradas de tempo encontradas:', entriesSnapshot.size);
    
    if (entriesSnapshot.size > 0) {
      console.log('📊 Detalhes das entradas:');
      entriesSnapshot.forEach((doc, index) => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        console.log(`   ${index + 1}. ${data.description} - ${data.hours}h - ${date.toLocaleDateString()}`);
      });
    }
    
    return { projects: projectsSnapshot.size, entries: entriesSnapshot.size };
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
    return { projects: 0, entries: 0 };
  }
};

// Função principal
const fixReportsData = async () => {
  console.log('🚀 Iniciando correção dos dados para relatórios...');
  
  try {
    // Verificar dados existentes
    const existing = await checkExistingData();
    
    // Criar dados se necessário
    if (existing.entries === 0) {
      await createCorrectTestData();
    } else {
      console.log('✅ Dados já existem, pulando criação');
    }
    
    // Testar geração de relatórios
    await testReportGeneration();
    
    console.log('\n🏁 Processo concluído!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Navegue para a página de relatórios (/reports)');
    console.log('2. Selecione o mês e ano atual');
    console.log('3. Clique em "Gerar Relatório"');
    console.log('4. Verifique se os dados aparecem');
    
  } catch (error) {
    console.error('❌ Erro no processo de correção:', error);
  }
};

// Disponibilizar funções globalmente
window.fixReports = {
  createCorrectTestData,
  testReportGeneration,
  checkExistingData,
  fixReportsData
};

// Executar correção automaticamente
fixReportsData();

console.log('\n🛠️ COMANDOS DISPONÍVEIS:');
console.log('- fixReports.fixReportsData() - Executar correção completa');
console.log('- fixReports.createCorrectTestData() - Criar dados de teste');
console.log('- fixReports.testReportGeneration() - Testar geração');
console.log('- fixReports.checkExistingData() - Verificar dados existentes');