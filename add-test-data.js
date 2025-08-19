// Script para adicionar dados de teste no localStorage
// Execute este código no console do navegador (F12)

// Função para gerar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para adicionar dados de teste
function addTestData() {
  console.log('🔧 Adicionando dados de teste...');
  
  // Verificar se já existem dados
  const existingClients = JSON.parse(localStorage.getItem('controle_horas_clients') || '[]');
  const existingProjects = JSON.parse(localStorage.getItem('controle_horas_projects') || '[]');
  const existingTimeEntries = JSON.parse(localStorage.getItem('controle_horas_time_entries') || '[]');
  
  console.log('📊 Dados existentes:');
  console.log('Clientes:', existingClients.length);
  console.log('Projetos:', existingProjects.length);
  console.log('Entradas de tempo:', existingTimeEntries.length);
  
  // Criar cliente de teste se não existir
  let testClient;
  if (existingClients.length === 0) {
    testClient = {
      id: generateId(),
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
      phone: '(11) 99999-9999',
      userId: 'user123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    existingClients.push(testClient);
    localStorage.setItem('controle_horas_clients', JSON.stringify(existingClients));
    console.log('✅ Cliente criado:', testClient.name);
  } else {
    testClient = existingClients[0];
    console.log('ℹ️ Usando cliente existente:', testClient.name);
  }
  
  // Criar projeto de teste se não existir
  let testProject;
  if (existingProjects.length === 0) {
    testProject = {
      id: generateId(),
      name: 'Projeto Teste',
      description: 'Projeto para testar relatórios de horas',
      userId: 'user123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    existingProjects.push(testProject);
    localStorage.setItem('controle_horas_projects', JSON.stringify(existingProjects));
    console.log('✅ Projeto criado:', testProject.name);
  } else {
    testProject = existingProjects[0];
    console.log('ℹ️ Usando projeto existente:', testProject.name);
  }
  
  // Criar entradas de tempo de teste se não existirem
  if (existingTimeEntries.length === 0) {
    const today = new Date();
    const timeEntries = [];
    
    // Criar entradas para os últimos 7 dias
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const entry = {
        id: generateId(),
        date: date.toISOString(),
        hours: (Math.random() * 6 + 2).toFixed(1), // Entre 2 e 8 horas
        description: `Trabalho realizado no dia ${date.toLocaleDateString('pt-BR')}`,
        projectId: testProject.id,
        userId: 'user123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      timeEntries.push(entry);
    }
    
    localStorage.setItem('controle_horas_time_entries', JSON.stringify(timeEntries));
    console.log(`✅ ${timeEntries.length} entradas de tempo criadas`);
    
    // Mostrar resumo das entradas
    const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
    console.log(`📊 Total de horas: ${totalHours.toFixed(1)}h`);
  } else {
    console.log('ℹ️ Entradas de tempo já existem:', existingTimeEntries.length);
  }
  
  console.log('\n🎉 Dados de teste adicionados com sucesso!');
  console.log('💡 Agora você pode testar a funcionalidade de relatórios.');
  console.log('📍 Vá para a página de Relatórios e gere um relatório para o mês atual.');
}

// Função para limpar todos os dados
function clearAllData() {
  const keys = [
    'controle_horas_clients',
    'controle_horas_projects', 
    'controle_horas_time_entries',
    'controle_horas_user'
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('🗑️ Todos os dados foram removidos do localStorage');
}

// Função para mostrar dados atuais
function showCurrentData() {
  const clients = JSON.parse(localStorage.getItem('controle_horas_clients') || '[]');
  const projects = JSON.parse(localStorage.getItem('controle_horas_projects') || '[]');
  const timeEntries = JSON.parse(localStorage.getItem('controle_horas_time_entries') || '[]');
  
  console.log('📊 Dados atuais no localStorage:');
  console.log('Clientes:', clients);
  console.log('Projetos:', projects);
  console.log('Entradas de tempo:', timeEntries);
  
  if (timeEntries.length > 0) {
    const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
    console.log(`Total de horas registradas: ${totalHours.toFixed(1)}h`);
  }
}

// Executar automaticamente
console.log('🚀 Script de dados de teste carregado!');
console.log('💡 Comandos disponíveis:');
console.log('  - addTestData() - Adiciona dados de teste');
console.log('  - clearAllData() - Remove todos os dados');
console.log('  - showCurrentData() - Mostra dados atuais');
console.log('');

// Adicionar dados automaticamente se não existirem
const hasData = localStorage.getItem('controle_horas_time_entries');
if (!hasData || JSON.parse(hasData).length === 0) {
  console.log('🔍 Nenhum dado encontrado. Adicionando dados de teste...');
  addTestData();
} else {
  console.log('ℹ️ Dados já existem. Use clearAllData() para limpar e addTestData() para recriar.');
  showCurrentData();
}