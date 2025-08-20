// Script para verificar se as variáveis de ambiente estão configuradas no Vercel
// Este script ajuda a diagnosticar problemas de configuração em produção

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Função para ler variáveis do arquivo .env
function readEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.log('❌ Arquivo .env não encontrado!');
        return {};
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=');
            if (key.startsWith('VITE_FIREBASE_')) {
                envVars[key] = value;
            }
        }
    });
    
    return envVars;
}

// Função para verificar variáveis no Vercel
function checkVercelEnv() {
    try {
        console.log('🔍 Verificando variáveis de ambiente no Vercel...');
        
        // Tentar listar variáveis do Vercel
        const result = execSync('vercel env ls', { encoding: 'utf8' });
        console.log('📋 Variáveis configuradas no Vercel:');
        console.log(result);
        
        return result;
    } catch (error) {
        console.log('❌ Erro ao verificar variáveis do Vercel:');
        console.log(error.message);
        
        if (error.message.includes('not found') || error.message.includes('não reconhecido')) {
            console.log('\n💡 Solução: Instale o Vercel CLI:');
            console.log('npm install -g vercel');
            console.log('vercel login');
        }
        
        return null;
    }
}

// Função principal
function main() {
    console.log('🚀 Verificação de Variáveis de Ambiente - Vercel vs Local\n');
    
    // Ler variáveis locais
    console.log('📁 Lendo variáveis do arquivo .env local...');
    const localVars = readEnvFile();
    
    console.log('\n🔧 Variáveis Firebase encontradas localmente:');
    Object.entries(localVars).forEach(([key, value]) => {
        const maskedValue = value.length > 10 ? 
            value.substring(0, 10) + '...' : value;
        console.log(`  ${key}=${maskedValue}`);
    });
    
    // Verificar variáveis no Vercel
    console.log('\n' + '='.repeat(50));
    const vercelResult = checkVercelEnv();
    
    // Análise e recomendações
    console.log('\n' + '='.repeat(50));
    console.log('📊 ANÁLISE E RECOMENDAÇÕES:\n');
    
    const requiredVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
        'VITE_FIREBASE_MEASUREMENT_ID'
    ];
    
    console.log('✅ Variáveis obrigatórias para o Firebase:');
    requiredVars.forEach(varName => {
        const hasLocal = localVars[varName] ? '✅' : '❌';
        console.log(`  ${hasLocal} ${varName}`);
    });
    
    if (!vercelResult) {
        console.log('\n🔧 PRÓXIMOS PASSOS:');
        console.log('1. Instalar Vercel CLI: npm install -g vercel');
        console.log('2. Fazer login: vercel login');
        console.log('3. Configurar variáveis: vercel env add [NOME_VARIAVEL]');
        console.log('4. Ou usar o painel web: https://vercel.com/dashboard');
    }
    
    console.log('\n📋 INSTRUÇÕES PARA CONFIGURAR NO VERCEL:');
    console.log('1. Acesse: https://vercel.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá em Settings > Environment Variables');
    console.log('4. Adicione cada variável VITE_FIREBASE_* com os valores do .env');
    console.log('5. Selecione "Production" como ambiente');
    console.log('6. Faça um novo deploy');
    
    console.log('\n🎯 VALORES PARA CONFIGURAR:');
    Object.entries(localVars).forEach(([key, value]) => {
        console.log(`${key}=${value}`);
    });
}

// Executar verificação
if (require.main === module) {
    main();
}

module.exports = { readEnvFile, checkVercelEnv };