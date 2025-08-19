// Script para verificar todas as possíveis fontes de dados
// Execute este script no console do navegador

console.log('🔍 Verificando todas as fontes de dados...');

// 1. Verificar se há conexão com Firebase
console.log('\n🔥 Verificando Firebase...');
if (window.firebase) {
  console.log('❌ Firebase está carregado!');
  console.log('Firebase apps:', window.firebase.apps);
  
  // Verificar se há configuração ativa
  if (window.firebase.apps.length > 0) {
    console.log('❌ Há apps Firebase ativos!');
    window.firebase.apps.forEach((app, index) => {
      console.log(`App ${index}:`, app.options);
    });
  }
} else {
  console.log('✅ Firebase não está carregado');
}

// 2. Verificar variáveis globais relacionadas a dados
console.log('\n🌐 Verificando variáveis globais...');
const globalVars = ['db', 'analytics', 'localStorageService'];
globalVars.forEach(varName => {
  if (window[varName]) {
    console.log(`❌ ${varName} está disponível globalmente:`, window[varName]);
  } else {
    console.log(`✅ ${varName} não está disponível globalmente`);
  }
});

// 3. Verificar se há dados sendo carregados via fetch/xhr
console.log('\n📡 Monitorando requisições de rede...');
const originalFetch = window.fetch;
const originalXHR = window.XMLHttpRequest;

// Interceptar fetch
window.fetch = function(...args) {
  console.log('🌐 Fetch detectado:', args[0]);
  return originalFetch.apply(this, args);
};

// Interceptar XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
  console.log('🌐 XHR detectado:', method, url);
  return originalOpen.apply(this, arguments);
};

// 4. Verificar se há service workers
console.log('\n👷 Verificando Service Workers...');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log('❌ Service Workers encontrados:');
      registrations.forEach((registration, index) => {
        console.log(`SW ${index}:`, registration.scope);
      });
    } else {
      console.log('✅ Nenhum Service Worker registrado');
    }
  });
} else {
  console.log('✅ Service Workers não suportados');
}

// 5. Verificar IndexedDB
console.log('\n💾 Verificando IndexedDB...');
if ('indexedDB' in window) {
  // Listar bancos de dados (método experimental)
  if (indexedDB.databases) {
    indexedDB.databases().then(databases => {
      if (databases.length > 0) {
        console.log('❌ Bancos IndexedDB encontrados:');
        databases.forEach(db => {
          console.log(`DB: ${db.name} (versão ${db.version})`);
        });
      } else {
        console.log('✅ Nenhum banco IndexedDB encontrado');
      }
    }).catch(err => {
      console.log('⚠️ Não foi possível listar bancos IndexedDB:', err.message);
    });
  } else {
    console.log('⚠️ indexedDB.databases() não está disponível');
  }
} else {
  console.log('✅ IndexedDB não suportado');
}

// 6. Verificar WebSQL (deprecated mas ainda pode existir)
console.log('\n🗄️ Verificando WebSQL...');
if (window.openDatabase) {
  console.log('⚠️ WebSQL está disponível (deprecated)');
} else {
  console.log('✅ WebSQL não está disponível');
}

// 7. Verificar cookies relacionados
console.log('\n🍪 Verificando cookies...');
const cookies = document.cookie.split(';');
const relevantCookies = cookies.filter(cookie => 
  cookie.includes('controle') || 
  cookie.includes('horas') || 
  cookie.includes('user') ||
  cookie.includes('firebase') ||
  cookie.includes('auth')
);

if (relevantCookies.length > 0) {
  console.log('❌ Cookies relevantes encontrados:');
  relevantCookies.forEach(cookie => {
    console.log(`Cookie: ${cookie.trim()}`);
  });
} else {
  console.log('✅ Nenhum cookie relevante encontrado');
}

// 8. Verificar se há dados sendo injetados via script
console.log('\n📜 Verificando scripts carregados...');
const scripts = document.querySelectorAll('script');
scripts.forEach((script, index) => {
  if (script.src) {
    if (script.src.includes('firebase') || script.src.includes('analytics')) {
      console.log(`❌ Script suspeito ${index}: ${script.src}`);
    }
  }
});

// 9. Verificar localStorage em intervalos
console.log('\n⏰ Monitorando mudanças no localStorage...');
let lastLocalStorageState = JSON.stringify(localStorage);

const monitorInterval = setInterval(() => {
  const currentState = JSON.stringify(localStorage);
  if (currentState !== lastLocalStorageState) {
    console.log('🚨 MUDANÇA DETECTADA NO LOCALSTORAGE!');
    console.log('Estado anterior:', lastLocalStorageState.length, 'caracteres');
    console.log('Estado atual:', currentState.length, 'caracteres');
    
    // Mostrar diferenças
    const oldKeys = Object.keys(JSON.parse(lastLocalStorageState || '{}'));
    const newKeys = Object.keys(localStorage);
    
    const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
    const removedKeys = oldKeys.filter(key => !newKeys.includes(key));
    
    if (addedKeys.length > 0) {
      console.log('➕ Chaves adicionadas:', addedKeys);
    }
    if (removedKeys.length > 0) {
      console.log('➖ Chaves removidas:', removedKeys);
    }
    
    lastLocalStorageState = currentState;
  }
}, 1000); // Verificar a cada segundo

// 10. Função para parar o monitoramento
window.pararMonitoramento = function() {
  clearInterval(monitorInterval);
  console.log('⏹️ Monitoramento parado');
  
  // Restaurar fetch e XHR originais
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalOpen;
  console.log('🔄 Interceptadores removidos');
};

console.log('\n✅ Verificação de fontes de dados concluída!');
console.log('\n📝 Comandos disponíveis:');
console.log('- pararMonitoramento() - Parar o monitoramento ativo');
console.log('\n⚠️ O monitoramento está ativo. Use pararMonitoramento() quando terminar.');