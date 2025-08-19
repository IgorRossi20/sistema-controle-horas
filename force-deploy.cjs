// Script para forçar novo deploy no Vercel
// Este script força um novo deploy adicionando um timestamp

const fs = require('fs')
const path = require('path')

console.log('🚀 Forçando novo deploy no Vercel...')

// 1. Adicionar timestamp ao package.json para forçar rebuild
const packagePath = path.join(__dirname, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

// Adicionar ou atualizar campo de deploy
packageJson.deployTimestamp = new Date().toISOString()

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
console.log('✅ Timestamp adicionado ao package.json')

// 2. Criar arquivo de versão para cache busting
const versionPath = path.join(__dirname, 'public', 'version.json')
const versionData = {
  version: Date.now(),
  timestamp: new Date().toISOString(),
  build: 'production-fix'
}

// Criar diretório public se não existir
const publicDir = path.join(__dirname, 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2))
console.log('✅ Arquivo de versão criado')

// 3. Atualizar index.html com meta tag para cache busting
const indexPath = path.join(__dirname, 'index.html')
let indexContent = fs.readFileSync(indexPath, 'utf8')

// Remover meta tag existente se houver
indexContent = indexContent.replace(/<meta name="cache-bust"[^>]*>/g, '')

// Adicionar nova meta tag
const metaTag = `<meta name="cache-bust" content="${Date.now()}">`
indexContent = indexContent.replace('<head>', `<head>\n    ${metaTag}`)

fs.writeFileSync(indexPath, indexContent)
console.log('✅ Meta tag de cache busting adicionada')

console.log('\n📋 PRÓXIMOS PASSOS:')
console.log('1. Commit e push das alterações:')
console.log('   git add .')
console.log('   git commit -m "fix: correções de segurança para arrays undefined"')
console.log('   git push')
console.log('\n2. Aguardar deploy automático do Vercel')
console.log('\n3. Verificar em: https://controlehoras.vercel.app/dashboard')
console.log('\n4. Testar com Ctrl+F5 para forçar reload sem cache')

console.log('\n🎯 Deploy forçado configurado com sucesso!')