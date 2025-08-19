const https = require('https');
const fs = require('fs');

console.log('🧪 Testando correções finais do erro de propriedades indefinidas...');
console.log('=' .repeat(60));

// Função para fazer requisição HTTPS
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testFinalFix() {
  try {
    console.log('📡 Verificando se o novo deploy está ativo...');
    
    // Verificar se o HTML principal foi atualizado
    const htmlContent = await httpsGet('https://controlehoras.vercel.app/');
    
    // Extrair o nome do arquivo JS principal
    const jsFileMatch = htmlContent.match(/\/assets\/index-([a-f0-9]+)\.js/);
    
    if (!jsFileMatch) {
      console.log('❌ Não foi possível encontrar o arquivo JS principal');
      return;
    }
    
    const jsFileName = jsFileMatch[0];
    const jsFileHash = jsFileMatch[1];
    
    console.log(`📄 Arquivo JS encontrado: ${jsFileName}`);
    console.log(`🔑 Hash do arquivo: ${jsFileHash}`);
    
    // Verificar se é um novo hash (diferente dos anteriores)
    const previousHashes = ['a8012390', 'a107d944', 'cb242cd5'];
    const isNewHash = !previousHashes.includes(jsFileHash);
    
    if (isNewHash) {
      console.log('✅ Novo hash detectado - deploy atualizado!');
    } else {
      console.log('⚠️ Hash conhecido - pode ser cache ou deploy não processado');
    }
    
    // Baixar e analisar o novo arquivo JS
    console.log('📥 Baixando arquivo JS para análise...');
    const jsUrl = `https://controlehoras.vercel.app${jsFileName}`;
    const jsContent = await httpsGet(jsUrl);
    
    // Salvar arquivo para análise
    const localFileName = `js-analysis-${jsFileHash}.js`;
    fs.writeFileSync(localFileName, jsContent);
    console.log(`💾 Arquivo salvo como: ${localFileName}`);
    
    // Análise de padrões problemáticos
    console.log('\n🔍 Analisando padrões problemáticos...');
    
    // Contar ocorrências de .length sem verificação
    const lengthMatches = jsContent.match(/\w+\.length/g) || [];
    console.log(`📊 Total de .length encontrados: ${lengthMatches.length}`);
    
    // Procurar por padrões específicos que podem causar erro
    const riskyPatterns = [
      /\w+\[\d+\]\.length/g,  // array[0].length
      /\w+\.\w+\.length/g,    // obj.prop.length
      /\(\w+\)\.length/g      // (variable).length
    ];
    
    let totalRiskyPatterns = 0;
    riskyPatterns.forEach((pattern, index) => {
      const matches = jsContent.match(pattern) || [];
      totalRiskyPatterns += matches.length;
      console.log(`🚨 Padrão arriscado ${index + 1}: ${matches.length} ocorrências`);
    });
    
    // Verificar se há tratamento de erro
    const errorHandlingPatterns = [
      /try\s*\{[\s\S]*?catch/g,
      /Array\.isArray/g,
      /typeof\s+\w+\s*===\s*['"]object['"]/g
    ];
    
    let totalErrorHandling = 0;
    errorHandlingPatterns.forEach((pattern, index) => {
      const matches = jsContent.match(pattern) || [];
      totalErrorHandling += matches.length;
      console.log(`✅ Tratamento de erro ${index + 1}: ${matches.length} ocorrências`);
    });
    
    console.log('\n📋 RESUMO DA ANÁLISE:');
    console.log('=' .repeat(40));
    console.log(`🔑 Hash do arquivo: ${jsFileHash}`);
    console.log(`🆕 É novo deploy: ${isNewHash ? 'SIM' : 'NÃO'}`);
    console.log(`📊 Total .length: ${lengthMatches.length}`);
    console.log(`🚨 Padrões arriscados: ${totalRiskyPatterns}`);
    console.log(`✅ Tratamentos de erro: ${totalErrorHandling}`);
    
    const riskLevel = totalRiskyPatterns > 100 ? 'ALTO' : totalRiskyPatterns > 50 ? 'MÉDIO' : 'BAIXO';
    console.log(`⚠️ Nível de risco: ${riskLevel}`);
    
    console.log('\n🎯 RECOMENDAÇÕES:');
    console.log('=' .repeat(40));
    
    if (isNewHash) {
      console.log('✅ 1. Deploy atualizado detectado');
      console.log('🔄 2. Teste a aplicação com Ctrl+F5 para limpar cache');
      console.log('🌐 3. Acesse: https://controlehoras.vercel.app/dashboard');
      
      if (totalErrorHandling > 10) {
        console.log('✅ 4. Tratamentos de erro detectados - boa cobertura');
      } else {
        console.log('⚠️ 4. Poucos tratamentos de erro - pode precisar de mais');
      }
    } else {
      console.log('⏳ 1. Aguarde mais alguns minutos para o deploy');
      console.log('🔄 2. Verifique https://vercel.com/dashboard');
      console.log('🚀 3. Considere fazer outro push se necessário');
    }
    
    console.log('\n🧪 SCRIPT DE TESTE PARA O NAVEGADOR:');
    console.log('=' .repeat(50));
    console.log(`
// Cole este código no console do navegador em https://controlehoras.vercel.app/dashboard
console.log('🧪 Testando correções de segurança...');

// Verificar se Vue está carregado
if (typeof Vue !== 'undefined') {
  console.log('✅ Vue.js carregado');
} else {
  console.log('❌ Vue.js não encontrado');
}

// Verificar se há erros no console
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  console.log('🚨 Erro capturado:', ...args);
  originalError.apply(console, args);
};

// Aguardar 5 segundos e reportar
setTimeout(() => {
  console.log('📊 Relatório de 5 segundos:');
  console.log('🚨 Erros capturados:', errorCount);
  
  if (errorCount === 0) {
    console.log('🎉 SUCESSO: Nenhum erro detectado!');
  } else {
    console.log('⚠️ Ainda há erros - verificar logs acima');
  }
  
  // Restaurar console.error original
  console.error = originalError;
}, 5000);

console.log('⏳ Aguardando 5 segundos para capturar erros...');
`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testFinalFix();