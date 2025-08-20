// Script para testar conectividade Firebase em produção
// Simula o comportamento da aplicação em produção

const https = require('https');
const fs = require('fs');
const path = require('path');

// Função para ler variáveis do .env
function loadEnvVars() {
    const envPath = path.join(__dirname, '.env');
    const envVars = {};
    
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...valueParts] = trimmed.split('=');
                envVars[key] = valueParts.join('=');
            }
        });
    }
    
    return envVars;
}

// Função para testar URL do Firestore
function testFirestoreUrl(projectId, callback) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    
    console.log(`🔍 Testando URL: ${url}`);
    
    const req = https.get(url, (res) => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                console.log(`✅ Resposta JSON:`, parsed);
            } catch (e) {
                console.log(`📄 Resposta (texto):`, data.substring(0, 500));
            }
            callback(null, { statusCode: res.statusCode, data });
        });
    });
    
    req.on('error', (error) => {
        console.log(`❌ Erro na requisição:`, error.message);
        callback(error);
    });
    
    req.setTimeout(10000, () => {
        console.log(`⏰ Timeout na requisição`);
        req.destroy();
        callback(new Error('Timeout'));
    });
}

// Função para testar com diferentes cenários
function testScenarios() {
    const envVars = loadEnvVars();
    const projectId = envVars.VITE_FIREBASE_PROJECT_ID;
    
    console.log('🚀 TESTE DE CONECTIVIDADE FIREBASE\n');
    console.log(`📋 Projeto ID: ${projectId}`);
    console.log(`🔑 API Key: ${envVars.VITE_FIREBASE_API_KEY ? envVars.VITE_FIREBASE_API_KEY.substring(0, 10) + '...' : 'NÃO ENCONTRADA'}`);
    
    if (!projectId || projectId === 'undefined') {
        console.log('❌ ERRO: VITE_FIREBASE_PROJECT_ID não está definido!');
        console.log('🔧 Isso explica os erros "projects/undefined/databases/(default)"');
        return;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTE 1: Verificação básica do projeto');
    console.log('='.repeat(60));
    
    testFirestoreUrl(projectId, (error, result) => {
        if (error) {
            console.log('❌ Falha no teste básico');
        } else {
            console.log('✅ Teste básico concluído');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🧪 TESTE 2: Simulando cenário de produção (undefined)');
        console.log('='.repeat(60));
        
        // Testar com undefined para simular o erro em produção
        testFirestoreUrl('undefined', (error2, result2) => {
            console.log('\n' + '='.repeat(60));
            console.log('📊 RESUMO DOS TESTES');
            console.log('='.repeat(60));
            
            console.log(`\n🎯 DIAGNÓSTICO:`);
            if (projectId && projectId !== 'undefined') {
                console.log(`✅ Variável VITE_FIREBASE_PROJECT_ID está correta localmente: ${projectId}`);
                console.log(`❌ Em produção, a variável está como "undefined"`);
                console.log(`🔧 SOLUÇÃO: Configurar as variáveis no Vercel`);
            } else {
                console.log(`❌ Variável VITE_FIREBASE_PROJECT_ID está incorreta: ${projectId}`);
            }
            
            console.log(`\n📋 PRÓXIMOS PASSOS:`);
            console.log(`1. Acesse https://vercel.com/dashboard`);
            console.log(`2. Selecione o projeto "controlehoras"`);
            console.log(`3. Vá em Settings > Environment Variables`);
            console.log(`4. Adicione todas as variáveis VITE_FIREBASE_*`);
            console.log(`5. Faça um novo deploy`);
            
            console.log(`\n🎯 VARIÁVEIS PARA CONFIGURAR:`);
            Object.entries(envVars).forEach(([key, value]) => {
                if (key.startsWith('VITE_FIREBASE_')) {
                    console.log(`${key}=${value}`);
                }
            });
        });
    });
}

// Executar testes
if (require.main === module) {
    testScenarios();
}

module.exports = { testFirestoreUrl, loadEnvVars };