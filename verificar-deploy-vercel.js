// VERIFICAÇÃO ESPECÍFICA PARA PROBLEMAS DE DEPLOY NO VERCEL
// Execute este script no console do navegador na URL de produção

console.log('🚀 VERIFICAÇÃO DE DEPLOY NO VERCEL');
console.log('🌐 URL:', window.location.href);
console.log('🕐 Timestamp:', new Date().toISOString());
console.log('=' .repeat(60));

// VERIFICAÇÃO 1: Headers de resposta do Vercel
console.log('\n📋 VERIFICAÇÃO 1: Headers do Vercel');

// Fazer uma requisição para verificar headers
fetch(window.location.href, { method: 'HEAD' })
  .then(response => {
    console.log('✅ Status da resposta:', response.status);
    console.log('📄 Headers relevantes:');
    
    const relevantHeaders = [
      'x-vercel-cache',
      'x-vercel-id',
      'server',
      'content-type',
      'cache-control'
    ];
    
    relevantHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        console.log(`  ${header}: ${value}`);
      }
    });
  })
  .catch(error => {
    console.log('❌ Erro ao verificar headers:', error.message);
  });

// VERIFICAÇÃO 2: Recursos estáticos
console.log('\n📋 VERIFICAÇÃO 2: Recursos estáticos');

// Verificar se os assets foram carregados corretamente
const checkAssets = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  console.log(`📜 Scripts externos: ${scripts.length}`);
  console.log(`🎨 Stylesheets: ${stylesheets.length}`);
  
  // Verificar se há assets do Vite
  const viteAssets = [...scripts, ...stylesheets].filter(el => {
    const src = el.src || el.href;
    return src && (src.includes('/assets/') || src.includes('index-') || src.includes('.js') || src.includes('.css'));
  });
  
  console.log(`⚡ Assets do Vite encontrados: ${viteAssets.length}`);
  
  if (viteAssets.length === 0) {
    console.log('❌ PROBLEMA: Nenhum asset do Vite encontrado!');
    console.log('💡 Isso indica que o build não foi deployado corretamente.');
  } else {
    console.log('✅ Assets do Vite encontrados:');
    viteAssets.forEach((asset, index) => {
      const src = asset.src || asset.href;
      console.log(`  ${index + 1}. ${src}`);
    });
  }
};

checkAssets();

// VERIFICAÇÃO 3: Estrutura do HTML
console.log('\n📋 VERIFICAÇÃO 3: Estrutura HTML');

// Verificar se o HTML foi processado pelo Vite
const htmlContent = document.documentElement.outerHTML;
const hasViteMarkers = htmlContent.includes('type="module"') || htmlContent.includes('/assets/');

if (hasViteMarkers) {
  console.log('✅ HTML processado pelo Vite detectado');
} else {
  console.log('❌ HTML não parece ter sido processado pelo Vite');
  console.log('💡 Verifique se o comando de build foi executado corretamente');
}

// Verificar meta tags
const metaTags = Array.from(document.querySelectorAll('meta'));
console.log(`🏷️ Meta tags encontradas: ${metaTags.length}`);

// Verificar título
const title = document.title;
console.log(`📝 Título da página: "${title}"`);

if (title.includes('Controle de horas')) {
  console.log('✅ Título correto encontrado');
} else {
  console.log('⚠️ Título pode não estar correto');
}

// VERIFICAÇÃO 4: Configuração SPA
console.log('\n📋 VERIFICAÇÃO 4: Configuração SPA');

// Verificar se as rotas SPA funcionam
const testSPARouting = () => {
  console.log('🔍 Testando roteamento SPA...');
  
  // Tentar navegar para uma rota específica
  const currentPath = window.location.pathname;
  console.log(`📍 Rota atual: ${currentPath}`);
  
  // Verificar se vercel.json está configurado corretamente
  // (isso só pode ser inferido pelo comportamento)
  if (currentPath !== '/' && !currentPath.includes('.')) {
    console.log('✅ Rota SPA detectada - vercel.json provavelmente configurado');
  } else if (currentPath === '/') {
    console.log('ℹ️ Na rota raiz - não é possível verificar configuração SPA');
  }
};

testSPARouting();

// VERIFICAÇÃO 5: Variáveis de ambiente
console.log('\n📋 VERIFICAÇÃO 5: Variáveis de ambiente');

try {
  // Verificar se import.meta.env está disponível
  if (typeof import !== 'undefined') {
    // Tentar acessar via dynamic import (pode não funcionar em todos os contextos)
    console.log('🔧 Tentando verificar variáveis de ambiente...');
    
    // Verificar se há indícios de variáveis de ambiente no código
    const scripts = Array.from(document.querySelectorAll('script'));
    let hasEnvVars = false;
    
    scripts.forEach(script => {
      if (script.textContent && script.textContent.includes('VITE_')) {
        hasEnvVars = true;
      }
    });
    
    if (hasEnvVars) {
      console.log('✅ Indícios de variáveis de ambiente encontrados no código');
    } else {
      console.log('⚠️ Nenhum indício de variáveis de ambiente encontrado');
      console.log('💡 Verifique se as variáveis estão configuradas no Vercel');
    }
  } else {
    console.log('❌ import não disponível - não é possível verificar variáveis');
  }
} catch (error) {
  console.log('❌ Erro ao verificar variáveis de ambiente:', error.message);
}

// VERIFICAÇÃO 6: Performance e carregamento
console.log('\n📋 VERIFICAÇÃO 6: Performance');

if (performance.timing) {
  const timing = performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
  
  console.log(`⏱️ Tempo total de carregamento: ${loadTime}ms`);
  console.log(`🏗️ Tempo até DOM ready: ${domReady}ms`);
  
  if (loadTime > 5000) {
    console.log('⚠️ Carregamento lento detectado (>5s)');
  } else {
    console.log('✅ Tempo de carregamento aceitável');
  }
}

// Verificar recursos que falharam
if (performance.getEntriesByType) {
  const resources = performance.getEntriesByType('resource');
  const failedResources = resources.filter(resource => 
    resource.transferSize === 0 && resource.decodedBodySize === 0 && !resource.name.includes('data:')
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

// VERIFICAÇÃO 7: Logs específicos do Vercel
console.log('\n📋 VERIFICAÇÃO 7: Diagnóstico específico');

// Verificar se é realmente o Vercel
const isVercel = window.location.hostname.includes('vercel.app');
if (isVercel) {
  console.log('✅ Confirmado: executando no Vercel');
  
  // Extrair informações da URL
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    console.log(`🏷️ Subdomínio: ${subdomain}`);
    
    // Verificar se é um deploy de preview ou produção
    if (subdomain.includes('-')) {
      console.log('🔄 Parece ser um deploy de preview/branch');
    } else {
      console.log('🚀 Parece ser o deploy de produção');
    }
  }
} else {
  console.log('⚠️ Não está executando no Vercel');
}

// VERIFICAÇÃO 8: Teste de funcionalidade básica
console.log('\n📋 VERIFICAÇÃO 8: Teste funcional');

setTimeout(() => {
  // Verificar se a aplicação Vue foi montada
  const appElement = document.getElementById('app');
  
  if (appElement && appElement.innerHTML.trim() !== '') {
    console.log('✅ Aplicação Vue montada com sucesso');
    
    // Verificar se há elementos específicos do dashboard
    const dashboardElements = [
      'nav', '.navbar',
      'h1', 'h2', 'h3',
      '.card', '.btn',
      '.container', '.row'
    ];
    
    let elementsFound = 0;
    dashboardElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elementsFound++;
      }
    });
    
    console.log(`🎯 Elementos de UI encontrados: ${elementsFound}/${dashboardElements.length}`);
    
    if (elementsFound >= 3) {
      console.log('✅ Interface parece estar carregada corretamente');
    } else {
      console.log('⚠️ Interface pode não estar completamente carregada');
    }
  } else {
    console.log('❌ Aplicação Vue NÃO foi montada');
  }
}, 1000);

// RELATÓRIO FINAL
setTimeout(() => {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL - DEPLOY VERCEL');
  console.log('=' .repeat(60));
  
  const problemas = [];
  const sucessos = [];
  
  // Verificar problemas comuns
  if (!document.getElementById('app') || document.getElementById('app').innerHTML.trim() === '') {
    problemas.push('Aplicação Vue não foi montada');
  } else {
    sucessos.push('Aplicação Vue montada');
  }
  
  const viteAssets = Array.from(document.querySelectorAll('script[src*="/assets/"], link[href*="/assets/"]'));
  if (viteAssets.length === 0) {
    problemas.push('Assets do Vite não encontrados');
  } else {
    sucessos.push(`${viteAssets.length} assets do Vite carregados`);
  }
  
  if (!window.location.hostname.includes('vercel.app')) {
    problemas.push('Não está executando no Vercel');
  } else {
    sucessos.push('Executando no Vercel');
  }
  
  // Mostrar resultados
  if (sucessos.length > 0) {
    console.log('\n✅ SUCESSOS:');
    sucessos.forEach((sucesso, index) => {
      console.log(`  ${index + 1}. ${sucesso}`);
    });
  }
  
  if (problemas.length > 0) {
    console.log('\n❌ PROBLEMAS DETECTADOS:');
    problemas.forEach((problema, index) => {
      console.log(`  ${index + 1}. ${problema}`);
    });
    
    console.log('\n🔧 AÇÕES RECOMENDADAS:');
    console.log('1. Verificar logs de build no Vercel Dashboard');
    console.log('2. Verificar se o comando de build está correto (npm run build)');
    console.log('3. Verificar se a pasta dist foi gerada corretamente');
    console.log('4. Verificar configurações de variáveis de ambiente');
    console.log('5. Tentar um novo deploy');
  } else {
    console.log('\n🎉 DIAGNÓSTICO: Deploy parece estar funcionando corretamente!');
    console.log('💡 Se ainda há problemas, podem ser específicos de componentes ou dados.');
  }
  
  console.log('\n🔗 LINKS ÚTEIS:');
  console.log('- Vercel Dashboard: https://vercel.com/dashboard');
  console.log('- Logs de build: https://vercel.com/dashboard > seu-projeto > Deployments');
  console.log('- Configurações: https://vercel.com/dashboard > seu-projeto > Settings');
  
  console.log('\n' + '=' .repeat(60));
}, 3000);

// FUNÇÕES AUXILIARES
window.verificarDeployVercel = () => {
  console.clear();
  location.reload();
};

window.testarRota = (rota) => {
  console.log(`🔍 Testando rota: ${rota}`);
  window.history.pushState({}, '', rota);
  setTimeout(() => {
    console.log(`📍 Rota atual após navegação: ${window.location.pathname}`);
    console.log(`🎯 Conteúdo do #app: ${document.getElementById('app')?.innerHTML.length || 0} caracteres`);
  }, 500);
};

console.log('\n📝 COMANDOS DISPONÍVEIS:');
console.log('- verificarDeployVercel() - Recarregar e verificar novamente');
console.log('- testarRota("/dashboard") - Testar navegação para rota específica');