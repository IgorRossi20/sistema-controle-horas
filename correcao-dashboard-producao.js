// Script de Correção para Dashboard em Produção
// Execute este script no console do navegador em https://controlehoras.vercel.app/dashboard

console.log('🔧 Iniciando correção do dashboard em produção...');

// 1. Verificar se Chart.js está carregado
function verificarChartJS() {
  console.log('📊 Verificando Chart.js...');
  
  if (typeof Chart === 'undefined') {
    console.warn('⚠️ Chart.js não encontrado, carregando via CDN...');
    
    // Carregar Chart.js via CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
    script.onload = function() {
      console.log('✅ Chart.js carregado com sucesso');
      // Tentar renderizar o gráfico novamente
      setTimeout(() => {
        if (window.Vue && window.Vue.getCurrentInstance) {
          console.log('🔄 Tentando re-renderizar gráfico...');
          // Trigger re-render do componente
          window.location.reload();
        }
      }, 1000);
    };
    script.onerror = function() {
      console.error('❌ Erro ao carregar Chart.js');
    };
    document.head.appendChild(script);
  } else {
    console.log('✅ Chart.js já está carregado');
  }
}

// 2. Verificar se Vue está funcionando
function verificarVue() {
  console.log('🔍 Verificando Vue.js...');
  
  const app = document.getElementById('app');
  if (!app) {
    console.error('❌ Elemento #app não encontrado');
    return false;
  }
  
  if (!app.innerHTML || app.innerHTML.trim() === '') {
    console.error('❌ Elemento #app está vazio');
    return false;
  }
  
  console.log('✅ Vue.js parece estar funcionando');
  return true;
}

// 3. Verificar erros no console
function verificarErros() {
  console.log('🔍 Verificando erros...');
  
  // Capturar erros futuros
  window.addEventListener('error', function(e) {
    console.error('❌ Erro capturado:', e.error);
    console.error('📍 Arquivo:', e.filename);
    console.error('📍 Linha:', e.lineno);
  });
  
  // Capturar erros de Promise rejeitadas
  window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Promise rejeitada:', e.reason);
  });
}

// 4. Verificar recursos carregados
function verificarRecursos() {
  console.log('📦 Verificando recursos carregados...');
  
  const scripts = document.querySelectorAll('script[src]');
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  
  console.log(`📜 Scripts carregados: ${scripts.length}`);
  console.log(`🎨 Stylesheets carregados: ${stylesheets.length}`);
  
  // Verificar se há recursos que falharam
  scripts.forEach((script, index) => {
    if (script.src) {
      fetch(script.src, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            console.warn(`⚠️ Script ${index + 1} falhou: ${script.src}`);
          }
        })
        .catch(error => {
          console.warn(`⚠️ Erro ao verificar script ${index + 1}: ${script.src}`);
        });
    }
  });
}

// 5. Verificar localStorage e dados
function verificarDados() {
  console.log('💾 Verificando dados locais...');
  
  try {
    const keys = Object.keys(localStorage);
    console.log('🔑 Chaves no localStorage:', keys.length);
    
    // Verificar dados específicos da aplicação
    const appKeys = keys.filter(key => 
      key.includes('projects') || 
      key.includes('timeEntries') || 
      key.includes('user') ||
      key.includes('pinia')
    );
    
    console.log('📊 Chaves da aplicação:', appKeys);
    
    appKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          console.log(`📋 ${key}:`, typeof parsed === 'object' ? Object.keys(parsed).length + ' items' : parsed);
        }
      } catch (e) {
        console.warn(`⚠️ Erro ao parsear ${key}:`, e.message);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar localStorage:', error);
  }
}

// 6. Tentar corrigir problemas comuns
function aplicarCorrecoes() {
  console.log('🔧 Aplicando correções...');
  
  // Correção 1: Garantir que o viewport está correto
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewport);
    console.log('✅ Viewport meta tag adicionada');
  }
  
  // Correção 2: Verificar se Bootstrap está carregado
  if (typeof bootstrap === 'undefined') {
    console.warn('⚠️ Bootstrap não encontrado');
    // Não vamos carregar Bootstrap via CDN pois pode conflitar
  } else {
    console.log('✅ Bootstrap está carregado');
  }
  
  // Correção 3: Limpar dados corrompidos se necessário
  try {
    const userStore = localStorage.getItem('user');
    if (userStore) {
      const parsed = JSON.parse(userStore);
      if (!parsed.userId) {
        console.log('🔄 Regenerando userId...');
        parsed.userId = 'user_' + Date.now();
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    }
  } catch (e) {
    console.warn('⚠️ Erro ao corrigir dados do usuário:', e.message);
  }
}

// 7. Função principal de diagnóstico e correção
function corrigirDashboard() {
  console.log('🚀 Iniciando correção completa do dashboard...');
  
  // Executar verificações
  verificarErros();
  
  if (!verificarVue()) {
    console.error('❌ Vue.js não está funcionando corretamente');
    console.log('🔄 Tentando recarregar a página...');
    setTimeout(() => window.location.reload(), 2000);
    return;
  }
  
  verificarRecursos();
  verificarDados();
  aplicarCorrecoes();
  verificarChartJS();
  
  console.log('✅ Correção concluída!');
  console.log('📋 Se o problema persistir, verifique:');
  console.log('   1. Conexão com a internet');
  console.log('   2. Cache do navegador (Ctrl+F5)');
  console.log('   3. Console para erros específicos');
}

// 8. Função de teste rápido
function testeRapido() {
  console.log('⚡ Executando teste rápido...');
  
  const testes = {
    'Vue.js': typeof Vue !== 'undefined',
    'Chart.js': typeof Chart !== 'undefined',
    'Bootstrap': typeof bootstrap !== 'undefined',
    'Element #app': !!document.getElementById('app'),
    'LocalStorage': typeof Storage !== 'undefined',
    'Router': !!document.querySelector('[data-v-router]') || !!document.querySelector('.router-link-active')
  };
  
  console.table(testes);
  
  const problemas = Object.entries(testes).filter(([key, value]) => !value);
  if (problemas.length > 0) {
    console.warn('⚠️ Problemas encontrados:', problemas.map(([key]) => key));
  } else {
    console.log('✅ Todos os testes básicos passaram!');
  }
  
  return problemas.length === 0;
}

// Executar automaticamente
corrigirDashboard();

// Disponibilizar funções globalmente para uso manual
window.corrigirDashboard = corrigirDashboard;
window.testeRapido = testeRapido;
window.verificarChartJS = verificarChartJS;

console.log('🎯 Funções disponíveis:');
console.log('   - corrigirDashboard() - Executa correção completa');
console.log('   - testeRapido() - Executa teste rápido');
console.log('   - verificarChartJS() - Verifica e carrega Chart.js');

// Monitorar mudanças na página
let observer;
if (typeof MutationObserver !== 'undefined') {
  observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Verificar se o dashboard foi carregado
        const dashboard = document.querySelector('.dashboard');
        if (dashboard && !dashboard.dataset.corrigido) {
          dashboard.dataset.corrigido = 'true';
          console.log('📊 Dashboard detectado, aplicando correções...');
          setTimeout(verificarChartJS, 500);
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

console.log('🎉 Script de correção carregado e ativo!');