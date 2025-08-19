// Script para limpar TODOS os dados persistentes da aplicação
// Execute este script no console do navegador

console.log('🧹 Iniciando limpeza completa de TODOS os dados...');

// 1. Limpar todas as chaves específicas do localStorage
const storageKeys = {
  clients: 'controle_horas_clients',
  projects: 'controle_horas_projects', 
  timeEntries: 'controle_horas_time_entries',
  user: 'controle_horas_user'
};

// Remover chaves específicas da aplicação
Object.values(storageKeys).forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  }
});

// 2. Limpar store do usuário (Pinia)
const userStoreKey = 'user-store';
if (localStorage.getItem(userStoreKey)) {
  localStorage.removeItem(userStoreKey);
  console.log(`✅ Removido store do usuário: ${userStoreKey}`);
}

// 3. Limpar qualquer outra chave relacionada ao controle de horas
const allKeys = Object.keys(localStorage);
allKeys.forEach(key => {
  if (key.includes('controle_horas') || key.includes('user-store') || key.includes('pinia')) {
    localStorage.removeItem(key);
    console.log(`✅ Removido chave adicional: ${key}`);
  }
});

// 4. Limpar sessionStorage também
sessionStorage.clear();
console.log('✅ SessionStorage limpo');

// 5. Limpar cache do navegador (se possível)
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log(`✅ Cache removido: ${name}`);
    });
  });
}

// 6. Verificar se ainda há dados
console.log('\n📊 Verificando dados restantes...');
console.log('LocalStorage keys:', Object.keys(localStorage));
console.log('SessionStorage keys:', Object.keys(sessionStorage));

// 7. Função para verificar dados específicos
function verificarDados() {
  console.log('\n🔍 Verificação detalhada:');
  
  Object.entries(storageKeys).forEach(([collection, key]) => {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`❌ ${collection}: ${Array.isArray(parsed) ? parsed.length : 'não é array'} itens`);
    } else {
      console.log(`✅ ${collection}: limpo`);
    }
  });
  
  const userStore = localStorage.getItem('user-store');
  if (userStore) {
    console.log(`❌ User store: ainda existe`);
  } else {
    console.log(`✅ User store: limpo`);
  }
}

verificarDados();

// 8. Função para forçar limpeza total (use apenas se necessário)
function limpezaForcada() {
  console.log('\n🚨 LIMPEZA FORÇADA - Removendo TUDO do localStorage...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Limpeza forçada concluída');
  verificarDados();
}

// 9. Função para recriar estrutura vazia (opcional)
function recriarEstrutura() {
  console.log('\n🔧 Recriando estrutura vazia...');
  Object.values(storageKeys).forEach(key => {
    localStorage.setItem(key, JSON.stringify([]));
  });
  console.log('✅ Estrutura vazia recriada');
  verificarDados();
}

console.log('\n🎯 Limpeza completa finalizada!');
console.log('\n📝 Comandos disponíveis:');
console.log('- verificarDados() - Verificar dados restantes');
console.log('- limpezaForcada() - Limpar TUDO (use com cuidado)');
console.log('- recriarEstrutura() - Recriar estrutura vazia');

// Recarregar a página após limpeza
console.log('\n🔄 Recarregando a página em 3 segundos...');
setTimeout(() => {
  window.location.reload();
}, 3000);