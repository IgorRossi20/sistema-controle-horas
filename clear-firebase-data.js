// Script para limpar dados do localStorage (simulando Firebase)
// Este script funciona com a configuração atual do projeto

// Simular localStorage no Node.js se necessário
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

// Função para limpar todos os dados do localStorage
function clearAllLocalStorageData() {
  console.log('🚀 Iniciando limpeza dos dados do localStorage...');
  
  const keys = [
    'controle_horas_clients',
    'controle_horas_projects', 
    'controle_horas_time_entries',
    'controle_horas_user'
  ];
  
  let totalRemoved = 0;
  
  console.log('\n📊 Verificando dados existentes:');
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
        console.log(`  - ${key}: ${count} registros`);
        totalRemoved += count;
      } catch (e) {
        console.log(`  - ${key}: dados inválidos`);
      }
    } else {
      console.log(`  - ${key}: vazio`);
    }
  });
  
  console.log('\n🗑️ Removendo dados...');
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  ✅ ${key} removido`);
  });
  
  console.log('\n🎉 Limpeza concluída com sucesso!');
  console.log(`📈 Total de registros removidos: ${totalRemoved}`);
  
  // Verificar se a limpeza foi bem-sucedida
  console.log('\n🔍 Verificando limpeza...');
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    console.log(`  - ${key}: ${data ? 'ainda tem dados' : 'limpo ✅'}`);
  });
}

// Função para limpar apenas dados de teste (mais segura)
function clearTestDataOnly() {
  console.log('🧹 Limpando apenas dados de teste...');
  
  const testKeys = [
    'controle_horas_time_entries',
    'controle_horas_projects'
  ];
  
  let totalRemoved = 0;
  
  testKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
        console.log(`🗑️ Removendo ${count} registros de ${key}`);
        totalRemoved += count;
      } catch (e) {
        console.log(`🗑️ Removendo dados inválidos de ${key}`);
      }
    }
    localStorage.removeItem(key);
  });
  
  console.log(`\n✅ Dados de teste removidos! Total: ${totalRemoved} registros`);
}

// Executar limpeza
console.log('🔧 Script de Limpeza de Dados');
console.log('\n⚠️  Este script irá limpar os dados de teste do localStorage');

// Executar limpeza de dados de teste por padrão
clearTestDataOnly();

console.log('\n🎯 Limpeza concluída!');
console.log('💡 Para limpar TODOS os dados, execute: clearAllLocalStorageData()');

// Exportar funções para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    clearAllLocalStorageData,
    clearTestDataOnly
  };
}