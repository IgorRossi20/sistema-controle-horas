// TESTE COMPARATIVO: PRODUÇÃO vs LOCAL
// Execute este script no console do navegador em ambos os ambientes

console.log('🔍 TESTE COMPARATIVO: PRODUÇÃO vs LOCAL');
console.log('🌐 URL atual:', window.location.href);
console.log('🕐 Timestamp:', new Date().toISOString());
console.log('=' .repeat(60));

// FUNÇÃO PRINCIPAL DE TESTE
function testarAplicacao() {
  const isProduction = window.location.hostname.includes('vercel.app');
  const isLocal = window.location.hostname === 'localhost';
  
  console.log(`\n🏷️ AMBIENTE: ${isProduction ? 'PRODUÇÃO' : isLocal ? 'LOCAL' : 'DESCONHECIDO'}`);
  
  // TESTE 1: Verificar se o Vue está carregado
  console.log('\n📋 TESTE 1: Framework Vue.js');
  if (window.Vue || window.__VUE__) {
    console.log('✅ Vue.js detectado');
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('🔧 Vue DevTools disponível');
    }
  } else {
    console.log('❌ Vue.js NÃO detectado - PROBLEMA CRÍTICO!');
  }
  
  // TESTE 2: Verificar elemento #app
  console.log('\n📋 TESTE 2: Elemento raiz da aplicação');
  const appElement = document.getElementById('app');
  if (appElement) {
    console.log('✅ Elemento #app encontrado');
    console.log(`📏 Conteúdo HTML: ${appElement.innerHTML.length} caracteres`);
    
    if (appElement.innerHTML.trim() === '') {
      console.log('❌ Elemento #app está VAZIO - Vue não foi montado!');
    } else {
      console.log('✅ Elemento #app tem conteúdo');
      
      // Verificar se há componentes Vue
      const vueComponents = appElement.querySelectorAll('[data-v-*]');
      console.log(`🔧 Componentes Vue encontrados: ${vueComponents.length}`);
    }
  } else {
    console.log('❌ Elemento #app NÃO encontrado - PROBLEMA CRÍTICO!');
  }
  
  // TESTE 3: Verificar scripts carregados
  console.log('\n📋 TESTE 3: Scripts carregados');
  const scripts = Array.from(document.querySelectorAll('script'));
  console.log(`📜 Total de scripts: ${scripts.length}`);
  
  const mainScript = scripts.find(s => s.src && s.src.includes('main') || s.src.includes('index'));
  if (mainScript) {
    console.log('✅ Script principal encontrado:', mainScript.src);
  } else {
    console.log('❌ Script principal NÃO encontrado!');
  }
  
  // TESTE 4: Verificar CSS
  console.log('\n📋 TESTE 4: Estilos CSS');
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  console.log(`🎨 Total de stylesheets: ${stylesheets.length}`);
  
  const bootstrapCSS = stylesheets.find(s => s.href.includes('bootstrap'));
  if (bootstrapCSS) {
    console.log('✅ Bootstrap CSS encontrado:', bootstrapCSS.href);
  } else {
    console.log('⚠️ Bootstrap CSS não encontrado via link externo');
  }
  
  // TESTE 5: Verificar erros no console
  console.log('\n📋 TESTE 5: Captura de erros');
  
  // Capturar erros futuros
  const errors = [];
  const originalError = console.error;
  console.error = function(...args) {
    errors.push({
      message: args.join(' '),
      timestamp: new Date().toISOString()
    });
    originalError.apply(console, args);
  };
  
  // Listener para erros não capturados
  window.addEventListener('error', (event) => {
    errors.push({
      type: 'uncaught_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      timestamp: new Date().toISOString()
    });
  });
  
  // TESTE 6: Verificar variáveis de ambiente (apenas em produção)
  if (isProduction) {
    console.log('\n📋 TESTE 6: Variáveis de ambiente (Produção)');
    
    try {
      // Tentar acessar variáveis Vite
      const hasViteEnv = typeof import.meta !== 'undefined' && import.meta.env;
      if (hasViteEnv) {
        console.log('✅ import.meta.env disponível');
        
        const envVars = [
          'VITE_FIREBASE_API_KEY',
          'VITE_FIREBASE_PROJECT_ID',
          'VITE_GOOGLE_API_KEY',
          'VITE_GOOGLE_CLIENT_ID'
        ];
        
        envVars.forEach(varName => {
          const value = import.meta.env[varName];
          if (value) {
            console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
          } else {
            console.log(`❌ ${varName}: não definida`);
          }
        });
      } else {
        console.log('❌ import.meta.env NÃO disponível');
      }
    } catch (error) {
      console.log('❌ Erro ao acessar variáveis de ambiente:', error.message);
    }
  }
  
  // TESTE 7: Verificar roteamento
  console.log('\n📋 TESTE 7: Sistema de roteamento');
  
  // Verificar se há elementos de navegação
  const navLinks = document.querySelectorAll('a[href*="/"]');
  console.log(`🔗 Links de navegação encontrados: ${navLinks.length}`);
  
  // Verificar rota atual
  console.log(`📍 Rota atual: ${window.location.pathname}`);
  
  if (window.location.pathname === '/dashboard') {
    console.log('✅ Está na rota /dashboard');
    
    // Verificar se o conteúdo do dashboard está presente
    const dashboardElements = [
      '.dashboard-header',
      '.stats-cards',
      '.chart-container',
      'h1, h2, h3' // Qualquer título
    ];
    
    let dashboardContentFound = false;
    dashboardElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✅ Elementos do dashboard encontrados: ${selector} (${elements.length})`);
        dashboardContentFound = true;
      }
    });
    
    if (!dashboardContentFound) {
      console.log('❌ PROBLEMA: Nenhum conteúdo do dashboard encontrado!');
    }
  }
  
  // TESTE 8: Verificar localStorage
  console.log('\n📋 TESTE 8: Armazenamento local');
  
  try {
    const localStorageKeys = Object.keys(localStorage);
    console.log(`💾 Chaves no localStorage: ${localStorageKeys.length}`);
    
    const appKeys = localStorageKeys.filter(key => 
      key.includes('controle_horas') || 
      key.includes('pinia') || 
      key.includes('user')
    );
    
    if (appKeys.length > 0) {
      console.log('✅ Dados da aplicação encontrados no localStorage:');
      appKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`  - ${key}: ${value ? value.substring(0, 50) + '...' : 'vazio'}`);
      });
    } else {
      console.log('⚠️ Nenhum dado da aplicação encontrado no localStorage');
    }
  } catch (error) {
    console.log('❌ Erro ao acessar localStorage:', error.message);
  }
  
  // RELATÓRIO FINAL após 2 segundos
  setTimeout(() => {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RELATÓRIO FINAL DO TESTE');
    console.log('=' .repeat(60));
    
    console.log(`\n🌐 Ambiente: ${isProduction ? 'PRODUÇÃO' : isLocal ? 'LOCAL' : 'DESCONHECIDO'}`);
    console.log(`🕐 Teste executado em: ${new Date().toISOString()}`);
    
    // Resumo dos problemas encontrados
    const problemas = [];
    
    if (!window.Vue && !window.__VUE__) {
      problemas.push('Vue.js não carregado');
    }
    
    if (!document.getElementById('app')) {
      problemas.push('Elemento #app não encontrado');
    } else if (document.getElementById('app').innerHTML.trim() === '') {
      problemas.push('Elemento #app vazio (Vue não montado)');
    }
    
    if (errors.length > 0) {
      problemas.push(`${errors.length} erro(s) JavaScript detectado(s)`);
    }
    
    if (problemas.length === 0) {
      console.log('\n✅ RESULTADO: Nenhum problema crítico detectado!');
      console.log('💡 Se o dashboard não aparece, pode ser um problema de CSS ou componente específico.');
    } else {
      console.log('\n❌ PROBLEMAS DETECTADOS:');
      problemas.forEach((problema, index) => {
        console.log(`  ${index + 1}. ${problema}`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n🚨 ERROS CAPTURADOS:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
      });
    }
    
    // Sugestões específicas por ambiente
    if (isProduction) {
      console.log('\n💡 SUGESTÕES PARA PRODUÇÃO:');
      console.log('1. Verificar logs do Vercel');
      console.log('2. Verificar se o build foi deployado corretamente');
      console.log('3. Verificar variáveis de ambiente no Vercel');
      console.log('4. Verificar se há diferenças entre build local e produção');
    } else if (isLocal) {
      console.log('\n💡 SUGESTÕES PARA LOCAL:');
      console.log('1. Verificar se npm run dev funciona');
      console.log('2. Verificar se há erros no terminal');
      console.log('3. Limpar cache do navegador');
      console.log('4. Reinstalar dependências (npm install)');
    }
    
    console.log('\n' + '=' .repeat(60));
  }, 2000);
  
  return {
    ambiente: isProduction ? 'produção' : isLocal ? 'local' : 'desconhecido',
    vueCarregado: !!(window.Vue || window.__VUE__),
    appElementEncontrado: !!document.getElementById('app'),
    appElementVazio: document.getElementById('app')?.innerHTML.trim() === '',
    totalScripts: scripts.length,
    totalStylesheets: stylesheets.length,
    errosCapturados: errors.length
  };
}

// EXECUTAR TESTE AUTOMATICAMENTE
const resultado = testarAplicacao();

// FUNÇÕES AUXILIARES
window.testarAplicacao = testarAplicacao;
window.reexecutarTeste = () => {
  console.clear();
  return testarAplicacao();
};

console.log('\n📝 COMANDOS DISPONÍVEIS:');
console.log('- testarAplicacao() - Executar teste completo');
console.log('- reexecutarTeste() - Limpar console e executar novamente');

// Retornar resultado para uso programático
resultado;