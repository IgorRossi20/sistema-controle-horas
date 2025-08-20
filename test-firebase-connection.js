// Script para testar conexão com Firebase e dados no Firestore
// Execute este script no console do navegador (F12)

console.log('🔥 TESTANDO CONEXÃO FIREBASE');
console.log('=' .repeat(50));

// Função para testar conexão com Firestore
const testFirestoreConnection = async () => {
  console.log('\n🔍 Testando conexão com Firestore...');
  
  try {
    // Importar Firebase dinamicamente
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
    const { getFirestore, collection, getDocs, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
    
    // Configuração do Firebase (usando as mesmas variáveis do .env)
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
    
    console.log('✅ Firebase inicializado com sucesso');
    
    // Testar leitura de dados
    console.log('\n📖 Testando leitura de dados...');
    
    // Verificar projetos
    try {
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      console.log('📁 Projetos encontrados:', projectsSnapshot.size);
      
      if (projectsSnapshot.size > 0) {
        projectsSnapshot.forEach((doc) => {
          console.log('   Projeto:', doc.id, doc.data());
        });
      }
    } catch (error) {
      console.log('❌ Erro ao buscar projetos:', error.message);
    }
    
    // Verificar entradas de tempo
    try {
      const timeEntriesSnapshot = await getDocs(collection(db, 'timeEntries'));
      console.log('⏰ Entradas de tempo encontradas:', timeEntriesSnapshot.size);
      
      if (timeEntriesSnapshot.size > 0) {
        timeEntriesSnapshot.forEach((doc) => {
          console.log('   Entrada:', doc.id, doc.data());
        });
      }
    } catch (error) {
      console.log('❌ Erro ao buscar entradas de tempo:', error.message);
    }
    
    // Se não há dados, criar dados de teste
    if (projectsSnapshot.size === 0 && timeEntriesSnapshot.size === 0) {
      console.log('\n🧪 Criando dados de teste...');
      await createTestData(db, addDoc, collection, serverTimestamp);
    }
    
  } catch (error) {
    console.log('❌ Erro na conexão com Firebase:', error);
  }
};

// Função para criar dados de teste
const createTestData = async (db, addDoc, collection, serverTimestamp) => {
  try {
    const userId = 'test-user-123';
    
    // Criar projeto de teste
    const projectData = {
      name: 'Projeto Teste',
      description: 'Projeto para testar relatórios',
      userId: userId,
      createdAt: serverTimestamp()
    };
    
    const projectRef = await addDoc(collection(db, 'projects'), projectData);
    console.log('✅ Projeto de teste criado:', projectRef.id);
    
    // Criar entradas de tempo de teste
    const timeEntries = [
      {
        userId: userId,
        projectId: projectRef.id,
        description: 'Desenvolvimento de funcionalidade',
        hours: '8.00',
        date: new Date('2025-01-15'),
        createdAt: serverTimestamp()
      },
      {
        userId: userId,
        projectId: projectRef.id,
        description: 'Reunião de planejamento',
        hours: '2.30',
        date: new Date('2025-01-16'),
        createdAt: serverTimestamp()
      },
      {
        userId: userId,
        projectId: projectRef.id,
        description: 'Testes e correções',
        hours: '4.15',
        date: new Date('2025-01-17'),
        createdAt: serverTimestamp()
      }
    ];
    
    for (const entry of timeEntries) {
      const entryRef = await addDoc(collection(db, 'timeEntries'), entry);
      console.log('✅ Entrada de tempo criada:', entryRef.id);
    }
    
    console.log('🎉 Dados de teste criados com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro ao criar dados de teste:', error);
  }
};

// Função para testar a função getTimeEntriesByPeriod
const testGetTimeEntriesByPeriod = async () => {
  console.log('\n🔍 Testando função getTimeEntriesByPeriod...');
  
  try {
    // Verificar se a função está disponível no escopo global
    if (window.timeEntriesService && window.timeEntriesService.getTimeEntriesByPeriod) {
      console.log('✅ Função getTimeEntriesByPeriod encontrada');
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const userId = 'test-user-123';
      
      console.log('📅 Buscando entradas para o usuário:', userId);
      console.log('📅 Período:', startDate.toLocaleDateString(), 'até', endDate.toLocaleDateString());
      
      const entries = await window.timeEntriesService.getTimeEntriesByPeriod(userId, startDate, endDate);
      console.log('📊 Entradas encontradas:', entries.length);
      
      if (entries.length > 0) {
        console.log('📝 Detalhes das entradas:');
        entries.forEach((entry, index) => {
          console.log(`   ${index + 1}. ${entry.description} - ${entry.hours}h - ${entry.date}`);
        });
      } else {
        console.log('⚠️ Nenhuma entrada encontrada para o período');
      }
      
    } else {
      console.log('❌ Função getTimeEntriesByPeriod não encontrada');
      console.log('💡 Verifique se o serviço foi importado corretamente');
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar getTimeEntriesByPeriod:', error);
  }
};

// Função para verificar autenticação
const checkAuthentication = () => {
  console.log('\n🔐 Verificando autenticação...');
  
  // Verificar se há usuário logado no localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('✅ Usuário encontrado no localStorage:', user.name || user.email || user.id);
      return user;
    } catch (error) {
      console.log('❌ Erro ao parsear dados do usuário:', error);
    }
  } else {
    console.log('⚠️ Nenhum usuário encontrado no localStorage');
  }
  
  // Verificar se há dados de sessão
  const sessionData = sessionStorage.getItem('user');
  if (sessionData) {
    try {
      const user = JSON.parse(sessionData);
      console.log('✅ Usuário encontrado no sessionStorage:', user.name || user.email || user.id);
      return user;
    } catch (error) {
      console.log('❌ Erro ao parsear dados da sessão:', error);
    }
  }
  
  return null;
};

// Função principal para executar todos os testes
const runAllTests = async () => {
  console.log('🚀 Iniciando testes completos...');
  
  // Verificar autenticação
  const user = checkAuthentication();
  
  // Testar conexão com Firebase
  await testFirestoreConnection();
  
  // Aguardar um pouco e testar a função de relatórios
  setTimeout(async () => {
    await testGetTimeEntriesByPeriod();
    
    console.log('\n🏁 Testes concluídos!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Se não há dados, execute createTestData()');
    console.log('2. Verifique se o usuário está autenticado');
    console.log('3. Teste a geração de relatórios na interface');
    console.log('4. Verifique o console por erros adicionais');
  }, 2000);
};

// Disponibilizar funções globalmente
window.firebaseTest = {
  testFirestoreConnection,
  testGetTimeEntriesByPeriod,
  checkAuthentication,
  runAllTests
};

// Executar testes automaticamente
runAllTests();

console.log('\n🛠️ COMANDOS DISPONÍVEIS:');
console.log('- firebaseTest.runAllTests() - Executar todos os testes');
console.log('- firebaseTest.testFirestoreConnection() - Testar conexão');
console.log('- firebaseTest.testGetTimeEntriesByPeriod() - Testar busca por período');
console.log('- firebaseTest.checkAuthentication() - Verificar autenticação');