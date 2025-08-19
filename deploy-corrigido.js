// Script de Deploy Corrigido para Vercel
// Execute este script após fazer o deploy para verificar se tudo está funcionando

console.log('🚀 Verificando deploy no Vercel...');

// Configurações
const PRODUCTION_URL = 'https://controlehoras.vercel.app';
const DASHBOARD_URL = `${PRODUCTION_URL}/dashboard`;

// Função para verificar se a aplicação está funcionando
async function verificarDeploy() {
  console.log('🔍 Verificando aplicação em produção...');
  
  try {
    // 1. Verificar se a página principal carrega
    console.log('📡 Testando página principal...');
    const response = await fetch(PRODUCTION_URL);
    
    if (!response.ok) {
      console.error(`❌ Erro na página principal: ${response.status} ${response.statusText}`);
      return false;
    }
    
    console.log('✅ Página principal carregou com sucesso');
    
    // 2. Verificar se o dashboard carrega
    console.log('📊 Testando dashboard...');
    const dashboardResponse = await fetch(DASHBOARD_URL);
    
    if (!dashboardResponse.ok) {
      console.error(`❌ Erro no dashboard: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
      return false;
    }
    
    console.log('✅ Dashboard carregou com sucesso');
    
    // 3. Verificar headers importantes
    console.log('🔧 Verificando headers...');
    const headers = {
      'Content-Type': response.headers.get('content-type'),
      'Cache-Control': response.headers.get('cache-control'),
      'X-Vercel-Cache': response.headers.get('x-vercel-cache'),
      'Server': response.headers.get('server')
    };
    
    console.table(headers);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao verificar deploy:', error);
    return false;
  }
}

// Função para verificar recursos estáticos
async function verificarRecursos() {
  console.log('📦 Verificando recursos estáticos...');
  
  const recursos = [
    '/assets/index.css',
    '/assets/index.js',
    '/favicon.ico'
  ];
  
  const resultados = [];
  
  for (const recurso of recursos) {
    try {
      const url = `${PRODUCTION_URL}${recurso}`;
      const response = await fetch(url, { method: 'HEAD' });
      
      resultados.push({
        recurso,
        status: response.status,
        ok: response.ok,
        size: response.headers.get('content-length') || 'N/A'
      });
      
    } catch (error) {
      resultados.push({
        recurso,
        status: 'ERRO',
        ok: false,
        error: error.message
      });
    }
  }
  
  console.table(resultados);
  return resultados.every(r => r.ok);
}

// Função para gerar relatório de deploy
function gerarRelatorio(deployOk, recursosOk) {
  console.log('\n📋 RELATÓRIO DE DEPLOY');
  console.log('========================');
  
  console.log(`🌐 URL de Produção: ${PRODUCTION_URL}`);
  console.log(`📊 Dashboard: ${DASHBOARD_URL}`);
  console.log(`✅ Deploy Principal: ${deployOk ? 'OK' : 'ERRO'}`);
  console.log(`📦 Recursos Estáticos: ${recursosOk ? 'OK' : 'ERRO'}`);
  
  if (deployOk && recursosOk) {
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Acesse o dashboard: ' + DASHBOARD_URL);
    console.log('   2. Teste todas as funcionalidades');
    console.log('   3. Verifique se os gráficos estão carregando');
    console.log('   4. Teste em diferentes navegadores');
  } else {
    console.log('\n❌ PROBLEMAS DETECTADOS NO DEPLOY');
    console.log('\n🔧 Ações recomendadas:');
    console.log('   1. Verifique os logs do Vercel');
    console.log('   2. Execute: npm run build localmente');
    console.log('   3. Teste com: npm run preview');
    console.log('   4. Verifique as variáveis de ambiente no Vercel');
    console.log('   5. Execute o script de correção no console do navegador');
  }
}

// Função para testar funcionalidades específicas
function gerarScriptTeste() {
  const script = `
// Script de Teste para Produção
// Cole este código no console do navegador em ${DASHBOARD_URL}

console.log('🧪 Iniciando testes de funcionalidade...');

// Teste 1: Verificar Vue.js
if (typeof Vue !== 'undefined') {
  console.log('✅ Vue.js está carregado');
} else {
  console.error('❌ Vue.js não encontrado');
}

// Teste 2: Verificar Chart.js
if (typeof Chart !== 'undefined') {
  console.log('✅ Chart.js está carregado');
} else {
  console.warn('⚠️ Chart.js não encontrado - será carregado via fallback');
}

// Teste 3: Verificar elemento principal
const app = document.getElementById('app');
if (app && app.innerHTML.trim()) {
  console.log('✅ Aplicação Vue montada corretamente');
} else {
  console.error('❌ Aplicação Vue não foi montada');
}

// Teste 4: Verificar localStorage
try {
  localStorage.setItem('test', 'ok');
  localStorage.removeItem('test');
  console.log('✅ localStorage funcionando');
} catch (e) {
  console.error('❌ Problema com localStorage:', e);
}

// Teste 5: Verificar dados da aplicação
const keys = Object.keys(localStorage).filter(k => 
  k.includes('projects') || k.includes('timeEntries') || k.includes('user')
);
console.log('📊 Dados da aplicação:', keys.length + ' chaves encontradas');

// Teste 6: Verificar roteamento
if (window.location.pathname === '/dashboard') {
  console.log('✅ Roteamento funcionando - está no dashboard');
} else {
  console.log('ℹ️ Não está na rota do dashboard:', window.location.pathname);
}

console.log('🎯 Testes concluídos!');
  `;
  
  console.log('\n🧪 SCRIPT DE TESTE GERADO:');
  console.log('============================');
  console.log(script);
  
  return script;
}

// Função principal
async function main() {
  console.log('🚀 Iniciando verificação completa do deploy...');
  
  const deployOk = await verificarDeploy();
  const recursosOk = await verificarRecursos();
  
  gerarRelatorio(deployOk, recursosOk);
  gerarScriptTeste();
  
  console.log('\n🔗 Links úteis:');
  console.log('   📊 Dashboard:', DASHBOARD_URL);
  console.log('   🏠 Home:', PRODUCTION_URL);
  console.log('   ⚙️ Vercel Dashboard: https://vercel.com/dashboard');
  console.log('   📝 Logs: https://vercel.com/dashboard (selecione o projeto)');
}

// Executar verificação
main().catch(console.error);

// Disponibilizar funções para uso manual
if (typeof window !== 'undefined') {
  window.verificarDeploy = verificarDeploy;
  window.verificarRecursos = verificarRecursos;
  window.gerarScriptTeste = gerarScriptTeste;
}

console.log('\n🎯 Funções disponíveis:');
console.log('   - verificarDeploy() - Testa a aplicação');
console.log('   - verificarRecursos() - Testa recursos estáticos');
console.log('   - gerarScriptTeste() - Gera script para testar no navegador');