// SOLUÇÃO COMPLETA PARA PROBLEMA DE PERSISTÊNCIA DE DADOS
// Execute este script no console do navegador (F12)

console.log('🔧 INICIANDO SOLUÇÃO COMPLETA PARA PERSISTÊNCIA DE DADOS...');
console.log('=' .repeat(60));

// ETAPA 1: IDENTIFICAR TODAS AS FONTES DE DADOS
console.log('\n📋 ETAPA 1: Identificando fontes de dados...');

// Verificar localStorage
const localStorageKeys = Object.keys(localStorage);
console.log('📦 LocalStorage keys encontradas:', localStorageKeys.length);
localStorageKeys.forEach(key => {
  console.log(`  - ${key}: ${localStorage.getItem(key)?.length || 0} caracteres`);
});

// Verificar sessionStorage
const sessionStorageKeys = Object.keys(sessionStorage);
console.log('📦 SessionStorage keys encontradas:', sessionStorageKeys.length);
sessionStorageKeys.forEach(key => {
  console.log(`  - ${key}: ${sessionStorage.getItem(key)?.length || 0} caracteres`);
});

// Verificar IndexedDB
if ('indexedDB' in window && indexedDB.databases) {
  indexedDB.databases().then(databases => {
    console.log('💾 IndexedDB databases encontrados:', databases.length);
    databases.forEach(db => {
      console.log(`  - ${db.name} (versão ${db.version})`);
    });
  }).catch(err => {
    console.log('⚠️ Não foi possível listar IndexedDB:', err.message);
  });
}

// Verificar cookies
const cookies = document.cookie.split(';').filter(c => c.trim());
console.log('🍪 Cookies encontrados:', cookies.length);
cookies.forEach(cookie => {
  console.log(`  - ${cookie.trim().split('=')[0]}`);
});

// Verificar Firebase
if (window.firebase) {
  console.log('🔥 Firebase detectado!');
  console.log('  - Apps ativos:', window.firebase.apps.length);
  window.firebase.apps.forEach((app, index) => {
    console.log(`  - App ${index}: ${app.options.projectId}`);
  });
} else {
  console.log('✅ Firebase não detectado');
}

// ETAPA 2: LIMPEZA COMPLETA
console.log('\n🧹 ETAPA 2: Executando limpeza completa...');

// Chaves específicas da aplicação
const appKeys = {
  clients: 'controle_horas_clients',
  projects: 'controle_horas_projects', 
  timeEntries: 'controle_horas_time_entries',
  user: 'controle_horas_user'
};

// Remover chaves específicas
Object.values(appKeys).forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  }
});

// Remover store do Pinia
const piniaKeys = ['user-store', 'pinia'];
piniaKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removido Pinia: ${key}`);
  }
});

// Remover qualquer chave relacionada
Object.keys(localStorage).forEach(key => {
  if (key.includes('controle_horas') || 
      key.includes('user-store') || 
      key.includes('pinia') ||
      key.includes('firebase') ||
      key.includes('auth')) {
    localStorage.removeItem(key);
    console.log(`✅ Removido chave relacionada: ${key}`);
  }
});

// Limpar sessionStorage
sessionStorage.clear();
console.log('✅ SessionStorage limpo');

// Limpar cache do navegador
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log(`✅ Cache removido: ${name}`);
    });
  });
}

// ETAPA 3: DESCONECTAR FIREBASE (SE ATIVO)
console.log('\n🔥 ETAPA 3: Desconectando Firebase...');
if (window.firebase && window.firebase.apps.length > 0) {
  try {
    window.firebase.apps.forEach(app => {
      app.delete();
      console.log(`✅ App Firebase desconectado: ${app.options.projectId}`);
    });
  } catch (error) {
    console.log('⚠️ Erro ao desconectar Firebase:', error.message);
  }
} else {
  console.log('✅ Nenhum app Firebase para desconectar');
}

// ETAPA 4: VERIFICAÇÃO FINAL
console.log('\n🔍 ETAPA 4: Verificação final...');

function verificarEstadoFinal() {
  console.log('\n📊 ESTADO FINAL:');
  
  // Verificar localStorage
  const remainingKeys = Object.keys(localStorage);
  console.log(`📦 LocalStorage: ${remainingKeys.length} chaves restantes`);
  if (remainingKeys.length > 0) {
    remainingKeys.forEach(key => {
      console.log(`  ❌ Restante: ${key}`);
    });
  } else {
    console.log('  ✅ LocalStorage completamente limpo');
  }
  
  // Verificar dados específicos da aplicação
  Object.entries(appKeys).forEach(([collection, key]) => {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`❌ ${collection}: ainda existe`);
    } else {
      console.log(`✅ ${collection}: limpo`);
    }
  });
  
  // Verificar Pinia
  const userStore = localStorage.getItem('user-store');
  if (userStore) {
    console.log('❌ User store: ainda existe');
  } else {
    console.log('✅ User store: limpo');
  }
}

verificarEstadoFinal();

// ETAPA 5: MONITORAMENTO DE REPOVOAMENTO
console.log('\n👀 ETAPA 5: Iniciando monitoramento...');

let monitoringActive = true;
let lastState = JSON.stringify(localStorage);

const monitorInterval = setInterval(() => {
  if (!monitoringActive) {
    clearInterval(monitorInterval);
    return;
  }
  
  const currentState = JSON.stringify(localStorage);
  if (currentState !== lastState) {
    console.log('\n🚨 REPOVOAMENTO DETECTADO!');
    console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
    
    const oldKeys = Object.keys(JSON.parse(lastState || '{}'));
    const newKeys = Object.keys(localStorage);
    
    const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
    const removedKeys = oldKeys.filter(key => !newKeys.includes(key));
    
    if (addedKeys.length > 0) {
      console.log('➕ Chaves adicionadas:', addedKeys);
      addedKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`  - ${key}: ${value?.substring(0, 100)}${value?.length > 100 ? '...' : ''}`);
      });
    }
    
    if (removedKeys.length > 0) {
      console.log('➖ Chaves removidas:', removedKeys);
    }
    
    lastState = currentState;
    
    // Se dados foram repovoados, mostrar stack trace
    if (addedKeys.length > 0) {
      console.log('📍 Stack trace do repovoamento:');
      console.trace();
    }
  }
}, 500); // Verificar a cada 500ms

// FUNÇÕES AUXILIARES
window.pararMonitoramento = function() {
  monitoringActive = false;
  console.log('⏹️ Monitoramento parado');
};

window.limpezaForcada = function() {
  console.log('\n🚨 EXECUTANDO LIMPEZA FORÇADA...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Limpeza forçada concluída');
  verificarEstadoFinal();
};

window.verificarEstado = verificarEstadoFinal;

window.recarregarPagina = function() {
  console.log('🔄 Recarregando página...');
  window.location.reload();
};

// ETAPA 6: INSTRUÇÕES FINAIS
console.log('\n' + '=' .repeat(60));
console.log('🎯 SOLUÇÃO COMPLETA EXECUTADA!');
console.log('\n📝 COMANDOS DISPONÍVEIS:');
console.log('- verificarEstado() - Verificar estado atual');
console.log('- limpezaForcada() - Limpar TUDO (emergência)');
console.log('- pararMonitoramento() - Parar monitoramento');
console.log('- recarregarPagina() - Recarregar página');

console.log('\n🔍 PRÓXIMOS PASSOS:');
console.log('1. Observe o monitoramento por alguns segundos');
console.log('2. Se dados reaparecerem, verifique o stack trace');
console.log('3. Recarregue a página para testar persistência');
console.log('4. Se problema persistir, verifique:');
console.log('   - Configurações do Firebase em produção');
console.log('   - Service Workers ativos');
console.log('   - Scripts de inicialização automática');

console.log('\n⚠️ IMPORTANTE:');
console.log('- O monitoramento está ATIVO');
console.log('- Use pararMonitoramento() quando terminar');
console.log('- Em produção, verifique se há sincronização automática com Firebase');

console.log('\n' + '=' .repeat(60));

// Auto-recarregar após 10 segundos se nenhum repovoamento for detectado
setTimeout(() => {
  if (Object.keys(localStorage).length === 0) {
    console.log('\n✅ Nenhum repovoamento detectado em 10 segundos');
    console.log('🔄 Recarregando página para teste final...');
    window.location.reload();
  }
}, 10000);