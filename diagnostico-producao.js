// DIAGNÓSTICO COMPLETO PARA ERROS EM PRODUÇÃO
// Execute este script no console do navegador (F12) na página com erro

console.log('🔍 INICIANDO DIAGNÓSTICO DE PRODUÇÃO...');
console.log('🌐 URL atual:', window.location.href);
console.log('🕐 Timestamp:', new Date().toISOString());
console.log('=' .repeat(60));

// ETAPA 1: INFORMAÇÕES BÁSICAS DO AMBIENTE
console.log('\n📋 ETAPA 1: Informações do Ambiente');
console.log('User Agent:', navigator.userAgent);
console.log('Plataforma:', navigator.platform);
console.log('Idioma:', navigator.language);
console.log('Online:', navigator.onLine);
console.log('Cookies habilitados:', navigator.cookieEnabled);

// ETAPA 2: VERIFICAR ERROS NO CONSOLE
console.log('\n🚨 ETAPA 2: Capturando Erros');

// Capturar erros JavaScript
const errors = [];
const originalError = console.error;
console.error = function(...args) {
  errors.push({
    type: 'error',
    message: args.join(' '),
    timestamp: new Date().toISOString(),
    stack: new Error().stack
  });
  originalError.apply(console, args);
};

// Capturar warnings
const warnings = [];
const originalWarn = console.warn;
console.warn = function(...args) {
  warnings.push({
    type: 'warning',
    message: args.join(' '),
    timestamp: new Date().toISOString()
  });
  originalWarn.apply(console, args);
};

// Listener para erros não capturados
window.addEventListener('error', (event) => {
  errors.push({
    type: 'uncaught_error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  });
  console.log('🚨 Erro não capturado:', event.message);
});

// Listener para promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  errors.push({
    type: 'unhandled_promise_rejection',
    message: event.reason?.message || event.reason,
    stack: event.reason?.stack,
    timestamp: new Date().toISOString()
  });
  console.log('🚨 Promise rejeitada:', event.reason);
});

// ETAPA 3: VERIFICAR RECURSOS CARREGADOS
console.log('\n📦 ETAPA 3: Verificando Recursos');

// Verificar scripts carregados
const scripts = Array.from(document.querySelectorAll('script'));
console.log(`📜 Scripts encontrados: ${scripts.length}`);
scripts.forEach((script, index) => {
  if (script.src) {
    console.log(`  ${index + 1}. ${script.src} - ${script.async ? 'async' : 'sync'}`);
  } else {
    console.log(`  ${index + 1}. Script inline - ${script.textContent.substring(0, 50)}...`);
  }
});

// Verificar CSS carregados
const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
console.log(`🎨 Stylesheets encontrados: ${stylesheets.length}`);
stylesheets.forEach((link, index) => {
  console.log(`  ${index + 1}. ${link.href}`);
});

// ETAPA 4: VERIFICAR VARIÁVEIS DE AMBIENTE
console.log('\n🔧 ETAPA 4: Verificando Configurações');

// Verificar se variáveis Vite estão disponíveis
const viteVars = {
  'VITE_FIREBASE_API_KEY': import.meta?.env?.VITE_FIREBASE_API_KEY,
  'VITE_FIREBASE_PROJECT_ID': import.meta?.env?.VITE_FIREBASE_PROJECT_ID,
  'VITE_FIREBASE_AUTH_DOMAIN': import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN,
  'VITE_GOOGLE_API_KEY': import.meta?.env?.VITE_GOOGLE_API_KEY,
  'VITE_GOOGLE_CLIENT_ID': import.meta?.env?.VITE_GOOGLE_CLIENT_ID
};

console.log('🔑 Variáveis de ambiente:');
Object.entries(viteVars).forEach(([key, value]) => {
  if (value) {
    console.log(`  ✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${key}: não definida`);
  }
});

// ETAPA 5: VERIFICAR FRAMEWORKS E BIBLIOTECAS
console.log('\n📚 ETAPA 5: Verificando Frameworks');

// Verificar Vue.js
if (window.Vue) {
  console.log('✅ Vue.js carregado:', window.Vue.version || 'versão desconhecida');
} else {
  console.log('❌ Vue.js não encontrado');
}

// Verificar se há instância Vue montada
const vueApps = document.querySelectorAll('[data-v-app]');
if (vueApps.length > 0) {
  console.log(`✅ ${vueApps.length} instância(s) Vue encontrada(s)`);
} else {
  console.log('❌ Nenhuma instância Vue encontrada');
}

// Verificar Firebase
if (window.firebase) {
  console.log('✅ Firebase carregado');
  console.log('  Apps:', window.firebase.apps.length);
} else {
  console.log('❌ Firebase não encontrado');
}

// Verificar Bootstrap
if (window.bootstrap) {
  console.log('✅ Bootstrap carregado');
} else {
  console.log('❌ Bootstrap não encontrado');
}

// ETAPA 6: VERIFICAR ROTEAMENTO
console.log('\n🛣️ ETAPA 6: Verificando Roteamento');

// Verificar Vue Router
if (window.VueRouter || window.__VUE_ROUTER__) {
  console.log('✅ Vue Router detectado');
} else {
  console.log('❌ Vue Router não encontrado');
}

// Verificar rota atual
console.log('📍 Rota atual:', window.location.pathname);
console.log('🔗 Hash:', window.location.hash);
console.log('❓ Query params:', window.location.search);

// ETAPA 7: VERIFICAR PERFORMANCE
console.log('\n⚡ ETAPA 7: Verificando Performance');

// Verificar tempo de carregamento
if (performance.timing) {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  console.log(`⏱️ Tempo de carregamento: ${loadTime}ms`);
}

// Verificar recursos com erro
if (performance.getEntriesByType) {
  const resources = performance.getEntriesByType('resource');
  const failedResources = resources.filter(resource => 
    resource.transferSize === 0 && resource.decodedBodySize === 0
  );
  
  if (failedResources.length > 0) {
    console.log('❌ Recursos que falharam ao carregar:');
    failedResources.forEach(resource => {
      console.log(`  - ${resource.name}`);
    });
  } else {
    console.log('✅ Todos os recursos carregaram com sucesso');
  }
}

// ETAPA 8: VERIFICAR DOM
console.log('\n🏗️ ETAPA 8: Verificando DOM');

// Verificar se o app Vue está montado
const appElement = document.getElementById('app');
if (appElement) {
  console.log('✅ Elemento #app encontrado');
  console.log('📏 Conteúdo:', appElement.innerHTML.length, 'caracteres');
  
  if (appElement.innerHTML.trim() === '') {
    console.log('❌ Elemento #app está vazio!');
  }
} else {
  console.log('❌ Elemento #app não encontrado!');
}

// Verificar elementos Vue
const vueElements = document.querySelectorAll('[data-v-*]');
console.log(`🔧 Elementos Vue encontrados: ${vueElements.length}`);

// ETAPA 9: TESTE DE CONECTIVIDADE
console.log('\n🌐 ETAPA 9: Testando Conectividade');

// Testar conexão com APIs
async function testConnectivity() {
  const tests = [
    { name: 'Google APIs', url: 'https://www.googleapis.com/calendar/v3' },
    { name: 'Firebase', url: 'https://firebase.googleapis.com' },
    { name: 'CDN Bootstrap', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' }
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url, { method: 'HEAD', mode: 'no-cors' });
      console.log(`✅ ${test.name}: conectado`);
    } catch (error) {
      console.log(`❌ ${test.name}: erro de conexão -`, error.message);
    }
  }
}

testConnectivity();

// ETAPA 10: RELATÓRIO FINAL
setTimeout(() => {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL DE DIAGNÓSTICO');
  console.log('=' .repeat(60));
  
  console.log(`\n🚨 Erros capturados: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. [${error.type}] ${error.message}`);
      if (error.stack) {
        console.log(`     Stack: ${error.stack.split('\n')[1] || 'N/A'}`);
      }
    });
  }
  
  console.log(`\n⚠️ Warnings capturados: ${warnings.length}`);
  if (warnings.length > 0) {
    warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning.message}`);
    });
  }
  
  // Diagnóstico automático
  console.log('\n🔍 DIAGNÓSTICO AUTOMÁTICO:');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Nenhum erro JavaScript detectado');
  }
  
  if (!document.getElementById('app')) {
    console.log('❌ PROBLEMA: Elemento #app não encontrado - possível erro de build');
  } else if (document.getElementById('app').innerHTML.trim() === '') {
    console.log('❌ PROBLEMA: App Vue não foi montado - possível erro de inicialização');
  }
  
  if (!window.Vue && !window.__VUE__) {
    console.log('❌ PROBLEMA: Vue.js não carregado - possível erro de bundle');
  }
  
  // Sugestões de correção
  console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
  console.log('1. Verificar se o build foi executado corretamente');
  console.log('2. Verificar se todas as dependências estão no package.json');
  console.log('3. Verificar configurações do Vercel');
  console.log('4. Verificar se há erros de sintaxe no código');
  console.log('5. Verificar se as variáveis de ambiente estão configuradas');
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Executar build local: npm run build');
  console.log('2. Testar build local: npm run preview');
  console.log('3. Verificar logs do Vercel');
  console.log('4. Verificar configurações de deploy');
  
  console.log('\n' + '=' .repeat(60));
}, 3000);

// FUNÇÕES AUXILIARES
window.gerarRelatorio = function() {
  const relatorio = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    errors: errors,
    warnings: warnings,
    scripts: scripts.map(s => s.src || 'inline'),
    stylesheets: stylesheets.map(s => s.href),
    viteVars: viteVars,
    performance: {
      loadTime: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : null
    }
  };
  
  console.log('📋 Relatório completo:', relatorio);
  return relatorio;
};

window.copiarRelatorio = function() {
  const relatorio = window.gerarRelatorio();
  navigator.clipboard.writeText(JSON.stringify(relatorio, null, 2))
    .then(() => console.log('✅ Relatório copiado para a área de transferência'))
    .catch(err => console.log('❌ Erro ao copiar:', err));
};

console.log('\n📝 COMANDOS DISPONÍVEIS:');
console.log('- gerarRelatorio() - Gerar relatório completo');
console.log('- copiarRelatorio() - Copiar relatório para área de transferência');
console.log('\n⚠️ Aguarde 3 segundos para o relatório final...');