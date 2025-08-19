# Guia de Deploy para Produção

## 📋 Pré-requisitos

- [ ] Conta no [Vercel](https://vercel.com)
- [ ] Projeto no [Google Cloud Console](https://console.cloud.google.com)
- [ ] Repositório no GitHub

## 🚀 Deploy no Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o projeto "HORAS"

### 2. Configurar Variáveis de Ambiente
No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
VITE_GOOGLE_API_KEY=sua_api_key_do_google_cloud
VITE_GOOGLE_CLIENT_ID=seu_client_id.googleusercontent.com
```

### 3. Configurar Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🔧 Configuração do Google Cloud Console

### 1. Atualizar Origens Autorizadas
Após o deploy, você receberá uma URL como `https://seu-projeto.vercel.app`

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **APIs e Serviços > Credenciais**
3. Clique no seu **OAuth 2.0 Client ID**
4. Em **Origens JavaScript autorizadas**, adicione:
   - `https://seu-projeto.vercel.app`
   - `https://seu-dominio-personalizado.com` (se aplicável)

### 2. Configurar Restrições da API Key (Recomendado)
1. Clique na sua **API Key**
2. Em **Restrições da aplicação**:
   - Selecione "Referenciadores HTTP (sites)"
   - Adicione:
     - `https://seu-projeto.vercel.app/*`
     - `https://seu-dominio-personalizado.com/*`
3. Em **Restrições da API**:
   - Selecione "Restringir chave"
   - Escolha "Google Calendar API"

## 🔒 Segurança

### Boas Práticas
- ✅ Use credenciais diferentes para desenvolvimento e produção
- ✅ Configure restrições de domínio na API Key
- ✅ Monitore o uso da API no Google Cloud Console
- ✅ Mantenha as credenciais seguras (nunca commite no código)

### Monitoramento
- Verifique logs no Vercel: **Functions > View Function Logs**
- Monitore uso da API: **Google Cloud Console > APIs e Serviços > Painel**

## 🌐 Domínio Personalizado (Opcional)

### No Vercel
1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### No Google Cloud Console
1. Adicione o novo domínio nas origens autorizadas
2. Atualize restrições da API Key

## 🧪 Teste em Produção

Após o deploy:

1. **Teste básico**:
   - [ ] Aplicação carrega corretamente
   - [ ] Navegação entre páginas funciona
   - [ ] Dados são salvos no localStorage

2. **Teste Google Calendar**:
   - [ ] Botão "Conectar Google Calendar" aparece
   - [ ] Autenticação funciona sem erros
   - [ ] Sincronização de eventos funciona
   - [ ] Importação automática funciona

3. **Teste de funcionalidades**:
   - [ ] Cadastro de clientes
   - [ ] Cadastro de projetos
   - [ ] Registro de horas
   - [ ] Geração de relatórios
   - [ ] Exportação PDF/Excel

## 🐛 Solução de Problemas

### Erro: "idpiframe_initialization_failed"
- ✅ Verifique se o domínio está nas origens autorizadas
- ✅ Confirme se está usando HTTPS em produção
- ✅ Limpe cache do navegador

### Erro: "invalid_client"
- ✅ Verifique se o Client ID está correto
- ✅ Confirme se o projeto no Google Cloud está ativo

### Erro: "API key invalid"
- ✅ Verifique se a API Key está correta
- ✅ Confirme se a Google Calendar API está habilitada
- ✅ Verifique restrições da API Key

### Build falha no Vercel
- ✅ Verifique se todas as dependências estão no package.json
- ✅ Confirme se não há erros de sintaxe
- ✅ Verifique logs de build no Vercel

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Vercel
2. Consulte a documentação do Google Calendar API
3. Verifique as configurações no Google Cloud Console

---

**Última atualização**: Janeiro 2025