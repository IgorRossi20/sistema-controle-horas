// Script para debugar problemas com relatórios

// Simular localStorage no Node.js
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    removeItem(key) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    }
  };
}

// Importar serviços
import localStorageService from './src/services/localStorage.js';
import { timeEntriesService } from './src/services/firebase.js';

// Função para criar dados de teste
function createTestData() {
  console.log('🔧 Criando dados de teste...');
  
  // Criar cliente de teste
  const testClient = {
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    userId: 'user123'
  };
  
  const client = localStorageService.addDocument('clients', testClient);
  console.log('✅ Cliente criado:', client);
  
  // Criar projeto de teste
  const testProject = {
    name: 'Projeto Teste',
    description: 'Projeto para testar relatórios',
    userId: 'user123'
  };
  
  const project = localStorageService.addDocument('projects', testProject);
  console.log('✅ Projeto criado:', project);
  
  // Criar entradas de tempo de teste
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const timeEntries = [
    {
      date: today.toISOString(),
      hours: 4.5,
      description: 'Desenvolvimento de funcionalidades',
      projectId: project.id,
      userId: 'user123'
    },
    {
      date: yesterday.toISOString(),
      hours: 3.0,
      description: 'Reunião com cliente',
      projectId: project.id,
      userId: 'user123'
    }
  ];
  
  timeEntries.forEach(entry => {
    const timeEntry = localStorageService.addDocument('timeEntries', entry);
    console.log('✅ Entrada de tempo criada:', timeEntry);
  });
  
  return { client, project, timeEntries };
}

// Função para testar relatórios
async function testReports() {
  console.log('\n📊 Testando funcionalidade de relatórios...');
  
  try {
    // Criar dados de teste
    const testData = createTestData();
    
    // Testar busca por período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 dias atrás
    const endDate = new Date();
    
    console.log('\n🔍 Buscando entradas por período:');
    console.log('Data início:', startDate.toISOString());
    console.log('Data fim:', endDate.toISOString());
    
    const entries = await timeEntriesService.getTimeEntriesByPeriod('user123', startDate, endDate);
    console.log('\n📋 Entradas encontradas:', entries.length);
    
    if (entries.length > 0) {
      console.log('\n📝 Detalhes das entradas:');
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.description} - ${entry.hours}h - ${entry.date}`);
      });
      
      // Agrupar por projeto
      const groupedByProject = {};
      entries.forEach(entry => {
        if (!groupedByProject[entry.projectId]) {
          groupedByProject[entry.projectId] = [];
        }
        groupedByProject[entry.projectId].push(entry);
      });
      
      console.log('\n📊 Horas por projeto:');
      Object.keys(groupedByProject).forEach(projectId => {
        const projectEntries = groupedByProject[projectId];
        const totalHours = projectEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
        console.log(`Projeto ${projectId}: ${totalHours.toFixed(2)} horas`);
      });
    } else {
      console.log('❌ Nenhuma entrada encontrada!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar relatórios:', error);
  }
}

// Executar teste
testReports();