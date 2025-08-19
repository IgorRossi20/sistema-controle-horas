// Script para forçar deploy no Vercel via Git
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Forçando deploy no Vercel via Git...')

try {
  // 1. Verificar se há mudanças para commit
  console.log('📋 Verificando status do Git...')
  const status = execSync('git status --porcelain', { encoding: 'utf8' })
  
  if (status.trim()) {
    console.log('📝 Mudanças detectadas:')
    console.log(status)
    
    // 2. Adicionar todas as mudanças
    console.log('➕ Adicionando mudanças...')
    execSync('git add .', { stdio: 'inherit' })
    
    // 3. Fazer commit
    const commitMessage = `fix: correções de segurança para arrays undefined - ${new Date().toISOString()}`
    console.log('💾 Fazendo commit...')
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' })
    
    // 4. Push para trigger deploy
    console.log('🚀 Fazendo push...')
    execSync('git push', { stdio: 'inherit' })
    
    console.log('\n✅ Deploy forçado com sucesso!')
    console.log('\n⏳ Aguarde alguns minutos para o Vercel processar o deploy')
    console.log('\n🔗 Verifique o progresso em: https://vercel.com/dashboard')
    console.log('\n🎯 Teste em: https://controlehoras.vercel.app/dashboard')
    
  } else {
    console.log('ℹ️ Nenhuma mudança detectada para commit')
    
    // Criar um commit vazio para forçar deploy
    console.log('🔄 Criando commit vazio para forçar deploy...')
    const emptyCommitMessage = `chore: force deploy - ${new Date().toISOString()}`
    execSync(`git commit --allow-empty -m "${emptyCommitMessage}"`, { stdio: 'inherit' })
    execSync('git push', { stdio: 'inherit' })
    
    console.log('\n✅ Deploy forçado com commit vazio!')
  }
  
} catch (error) {
  console.error('❌ Erro durante o processo:', error.message)
  
  // Tentar verificar se é problema de configuração do Git
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' })
    console.log('\n📍 Remote URL:', remoteUrl.trim())
    
    const branch = execSync('git branch --show-current', { encoding: 'utf8' })
    console.log('📍 Branch atual:', branch.trim())
    
  } catch (gitError) {
    console.error('❌ Erro ao verificar configuração do Git:', gitError.message)
    console.log('\n💡 Verifique se:')
    console.log('   1. O repositório Git está configurado')
    console.log('   2. Você tem permissões para push')
    console.log('   3. O remote origin está configurado corretamente')
  }
}

console.log('\n📋 PRÓXIMOS PASSOS:')
console.log('1. Aguardar deploy automático do Vercel (2-5 minutos)')
console.log('2. Verificar logs em: https://vercel.com/dashboard')
console.log('3. Testar aplicação em: https://controlehoras.vercel.app/dashboard')
console.log('4. Usar Ctrl+F5 para forçar reload sem cache')