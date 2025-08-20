# Configuração de Variáveis de Ambiente no Vercel

## ⚠️ PROBLEMA IDENTIFICADO
O erro em produção mostra `projects/undefined/databases/(default)`, indicando que as variáveis de ambiente do Firebase não estão configuradas no Vercel.

## 🔧 SOLUÇÃO: Configure as seguintes variáveis no painel do Vercel

### Acesse: https://vercel.com/dashboard
1. Vá para o projeto `controlehoras`
2. Clique em **Settings** > **Environment Variables**
3. Adicione as seguintes variáveis:

```
VITE_FIREBASE_API_KEY=AIzaSyDRz7RfzKa7unVyy3QHPKXCauPH_4kWbME
VITE_FIREBASE_PROJECT_ID=controlehoras-1d95d
VITE_FIREBASE_AUTH_DOMAIN=controlehoras-1d95d.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=controlehoras-1d95d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=67121306586
VITE_FIREBASE_APP_ID=1:67121306586:web:bd6d77fdc4b127e7ecbee3
VITE_FIREBASE_MEASUREMENT_ID=G-7K8C53E9KG
```

### ⚙️ Configuração para cada variável:
- **Environment**: Production
- **Git Branch**: main (ou a branch principal)

### 🚀 Após configurar:
1. Faça um novo deploy: `vercel --prod`
2. Ou force um redeploy no painel do Vercel

## 📋 Checklist:
- [ ] Todas as 7 variáveis VITE_FIREBASE_* configuradas
- [ ] Environment definido como "Production"
- [ ] Deploy realizado após configuração
- [ ] Teste da aplicação em produção

## 🔍 Verificação:
Após o deploy, a URL do Firestore deve mudar de:
❌ `projects/undefined/databases/(default)`
✅ `projects/controlehoras-1d95d/databases/(default)`