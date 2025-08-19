// Script para limpar completamente todos os dados do localStorage
// Execute este script no console do navegador

console.log('🧹 Iniciando limpeza completa de dados...');

// Limpar todas as chaves relacionadas ao controle de horas
const keysToRemove = [
  'controle_horas_clients',
  'controle_horas_projects', 
  'controle_horas_time_entries',
  'controle_horas_user',
  'user-store',
  'pinia-user'
];

// Remover chaves específicas
keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  } else {
    console.log(`ℹ️ Não encontrado: ${key}`);
  }
});

// Verificar se há outras chaves relacionadas
console.log('\n📋 Todas as chaves no localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`- ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
}

// Limpar TUDO do localStorage (use com cuidado!)
const clearAll = () => {
  const totalKeys = localStorage.length;
  localStorage.clear();
  console.log(`🗑️ Removidas ${totalKeys} chaves do localStorage`);
};

// Verificar dados após limpeza
const checkData = () => {
  console.log('\n🔍 Verificando dados após limpeza:');
  keysToRemove.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`❌ AINDA EXISTE: ${key} = ${data}`);
    } else {
      console.log(`✅ Limpo: ${key}`);
    }
  });
};

console.log('\n📝 Comandos disponíveis:');
console.log('- clearAll() - Limpa TUDO do localStorage');
console.log('- checkData() - Verifica se os dados foram removidos');
console.log('\n⚠️ IMPORTANTE: Recarregue a página após executar a limpeza!');

// Executar verificação inicial
checkData();