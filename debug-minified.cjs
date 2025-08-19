// Script para debugar erro no código minificado
const https = require('https')
const fs = require('fs')

console.log('🔍 Analisando erro no código minificado...')

// URL do arquivo JavaScript com erro
const jsUrl = 'https://controlehoras.vercel.app/assets/index-a107d944.js'

console.log('📥 Baixando arquivo JavaScript...')

https.get(jsUrl, (response) => {
  let data = ''
  
  response.on('data', (chunk) => {
    data += chunk
  })
  
  response.on('end', () => {
    console.log('✅ Arquivo baixado com sucesso')
    
    // Salvar arquivo para análise
    fs.writeFileSync('debug-minified.js', data)
    console.log('💾 Arquivo salvo como debug-minified.js')
    
    // Procurar por padrões que podem causar o erro
    console.log('\n🔍 Analisando padrões problemáticos...')
    
    // Procurar por .length sem verificação
    const lengthMatches = data.match(/\w+\.length/g) || []
    console.log(`📊 Encontradas ${lengthMatches.length} ocorrências de .length`)
    
    // Procurar por padrões específicos que podem causar erro
    const problematicPatterns = [
      /\w+\.length(?!\s*[><=!])/g,  // .length não seguido de comparação
      /\w+\[\w+\]\.length/g,        // array[index].length
      /\w+\(\)\.length/g,           // function().length
    ]
    
    problematicPatterns.forEach((pattern, index) => {
      const matches = data.match(pattern) || []
      if (matches.length > 0) {
        console.log(`⚠️ Padrão ${index + 1}: ${matches.length} ocorrências`)
        console.log(`   Exemplos: ${matches.slice(0, 3).join(', ')}`)
      }
    })
    
    // Procurar por função r3 especificamente (mencionada no erro)
    const r3Match = data.match(/function r3\([^}]+\}/g)
    if (r3Match) {
      console.log('\n🎯 Função r3 encontrada:')
      console.log(r3Match[0].substring(0, 200) + '...')
    }
    
    // Procurar por contexto ao redor da linha 661
    const lines = data.split('\n')
    if (lines.length > 12) {
      console.log('\n📍 Contexto da linha 12 (onde ocorre o erro):')
      const startLine = Math.max(0, 12 - 2)
      const endLine = Math.min(lines.length, 12 + 3)
      
      for (let i = startLine; i < endLine; i++) {
        const marker = i === 12 ? '>>> ' : '    '
        console.log(`${marker}${i}: ${lines[i].substring(0, 100)}...`)
      }
    }
    
    console.log('\n💡 ANÁLISE CONCLUÍDA')
    console.log('\n🔧 PRÓXIMAS AÇÕES RECOMENDADAS:')
    console.log('1. Verificar se todas as propriedades computadas retornam arrays válidos')
    console.log('2. Adicionar verificações de segurança em todas as funções que usam .length')
    console.log('3. Verificar se o problema está na inicialização dos dados reativos')
    console.log('4. Considerar usar um debugger no navegador para identificar a linha exata')
  })
  
}).on('error', (error) => {
  console.error('❌ Erro ao baixar arquivo:', error.message)
  
  console.log('\n🔧 ALTERNATIVA: Análise manual')
  console.log('1. Abra https://controlehoras.vercel.app/dashboard no navegador')
  console.log('2. Abra as ferramentas de desenvolvedor (F12)')
  console.log('3. Vá para a aba Sources')
  console.log('4. Encontre o arquivo index-a107d944.js')
  console.log('5. Procure pela linha 661 na função r3')
  console.log('6. Adicione um breakpoint para identificar qual variável está undefined')
})