// Script para configurar variáveis de ambiente no Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lê o arquivo .env local
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => 
  line.trim() && 
  !line.startsWith('#') && 
  line.includes('=') &&
  line.startsWith('VITE_FIREBASE_')
);

console.log('🔧 Configurando variáveis de ambiente do Firebase no Vercel...');

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').trim();
  
  if (value && value !== 'sua_api_key_aqui' && value !== 'seu_client_id_aqui.googleusercontent.com') {
    try {
      console.log(`📝 Configurando ${key}...`);
      execSync(`vercel env add ${key} production`, {
        input: value + '\n',
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log(`✅ ${key} configurado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao configurar ${key}:`, error.message);
    }
  }
});

console.log('\n🚀 Configuração concluída! Execute um novo deploy para aplicar as mudanças.');
console.log('💡 Comando: vercel --prod');