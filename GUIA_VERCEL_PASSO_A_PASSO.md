# 🔧 Guia Passo a Passo: Configurar Variáveis de Ambiente no Vercel

## 📋 O que você precisa fazer

Você precisa adicionar **7 variáveis de ambiente** no painel do Vercel para que sua aplicação funcione em produção.

---

## 🚀 Passo 1: Acessar o Painel do Vercel

1. **Abra seu navegador** e acesse: https://vercel.com/dashboard
2. **Faça login** na sua conta Vercel
3. **Encontre o projeto** chamado **"controlehoras"** na lista de projetos
4. **Clique no nome do projeto** para abrir a página do projeto

### 🔍 O que você deve ver:
- Uma lista com todos os seus projetos
- O projeto **"controlehoras"** deve estar listado
- Ao clicar, você será direcionado para a página principal do projeto

---

## ⚙️ Passo 2: Ir para Configurações

1. No projeto aberto, procure a aba **"Settings"** (Configurações) no topo da página
2. Clique em **"Settings"**
3. No menu lateral esquerdo, procure e clique em **"Environment Variables"**

### 📸 Como encontrar:
- **Na página do projeto**, você verá abas horizontais no topo: **Overview**, **Functions**, **Analytics**, **Settings**
- **Clique na aba "Settings"** (última aba à direita)
- **No lado esquerdo** aparecerá um menu vertical com várias opções como:
  - General
  - Domains
  - **Environment Variables** ← Esta é a que você quer!
  - Git
  - Security
- **Clique em "Environment Variables"** no menu lateral esquerdo

---

## 📝 Passo 3: Adicionar as Variáveis (Uma por vez)

### 🔍 Como adicionar cada variável:

1. **Na página Environment Variables**, procure o botão azul **"Add New"** (canto superior direito)
2. **Clique no botão "Add New"** - uma janela popup/modal vai abrir
3. **Preencha os 3 campos** que aparecerão na janela:
   - **Name** (Nome): Cole exatamente o nome da variável (ex: VITE_FIREBASE_API_KEY)
   - **Value** (Valor): Cole exatamente o valor da variável
   - **Environment**: Você verá 3 checkboxes:
     - ❌ **Development** (desmarque)
     - ❌ **Preview** (desmarque) 
     - ✅ **Production** (marque APENAS esta)
4. **Clique em "Save"** ou **"Add"** para salvar a variável
5. **Repita o processo** para todas as 7 variáveis (uma por vez)

### 🎯 Dica Visual:
- Se você não vê o botão "Add New", role a página para cima
- A janela popup tem fundo escuro/transparente
- Os campos Name e Value são caixas de texto brancas
- As checkboxes de Environment ficam uma abaixo da outra

### ⚠️ IMPORTANTE:
- **Copie e cole** exatamente como mostrado (sem espaços extras)
- **Marque apenas "Production"** no campo Environment
- **Adicione uma variável por vez** (não todas de uma vez)

Para **CADA** variável abaixo, siga os passos acima:

### 🔑 Variável 1 de 7
```
Name (Nome): VITE_FIREBASE_API_KEY
Value (Valor): AIzaSyDRz7RfzKa7unVyy3QHPKXCauPH_4kWbME
Environment: Production (marcar apenas Production)
```

### 🔑 Variável 2 de 7
```
Name (Nome): VITE_FIREBASE_PROJECT_ID
Value (Valor): controlehoras-1d95d
Environment: Production (marcar apenas Production)
```

### 🔑 Variável 3 de 7
```
Name (Nome): VITE_FIREBASE_AUTH_DOMAIN
Value (Valor): controlehoras-1d95d.firebaseapp.com
Environment: Production (marcar apenas Production)
```

### 🔑 Variável 4 de 7
```
Name (Nome): VITE_FIREBASE_STORAGE_BUCKET
Value (Valor): controlehoras-1d95d.firebasestorage.app
Environment: Production (marcar apenas Production)
```

### 🔑 Variável 5 de 7
```
Name (Nome): VITE_FIREBASE_MESSAGING_SENDER_ID
Value (Valor): 67121306586
Environment: Production (marcar apenas Production)
```

### 🔑 Variável 6 de 7
```
Name (Nome): VITE_FIREBASE_APP_ID
Value (Valor): 1:67121306586:web:bd6d77fdc4b127e7ecbee3
Environment: Production (marcar apenas Production)
```

### 🔑 Variável 7 de 7
```
Name (Nome): VITE_FIREBASE_MEASUREMENT_ID
Value (Valor): G-7K8C53E9KG
Environment: Production (marcar apenas Production)
```

---

## 🎯 Passo 4: Fazer Novo Deploy

Após adicionar **TODAS as 7 variáveis**:

1. Vá para a aba **"Deployments"** do seu projeto
2. Clique no botão **"Redeploy"** no deploy mais recente
3. Aguarde o deploy terminar (alguns minutos)

---

## ✅ Passo 5: Verificar se Funcionou

1. Acesse: https://controlehoras.vercel.app
2. Abra o **Console do Navegador** (F12)
3. Se não houver mais erros de Firebase, está funcionando! 🎉

---

## 🆘 Dicas Importantes

- **Copie e cole** os valores exatamente como mostrado
- **Não adicione espaços** antes ou depois dos valores
- Certifique-se de marcar **apenas "Production"** para cada variável
- Se alguma variável já existir, **delete e crie novamente**

---

## 🔍 Checklist Final

- [ ] VITE_FIREBASE_API_KEY adicionada
- [ ] VITE_FIREBASE_PROJECT_ID adicionada
- [ ] VITE_FIREBASE_AUTH_DOMAIN adicionada
- [ ] VITE_FIREBASE_STORAGE_BUCKET adicionada
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID adicionada
- [ ] VITE_FIREBASE_APP_ID adicionada
- [ ] VITE_FIREBASE_MEASUREMENT_ID adicionada
- [ ] Novo deploy realizado
- [ ] Aplicação testada em produção

---

## 📞 Precisa de Ajuda?

Se ainda houver erros após seguir todos os passos:
1. Verifique se **todas as 7 variáveis** estão listadas no Vercel
2. Confirme que os **valores estão corretos** (sem espaços extras)
3. Faça um **novo deploy** após qualquer alteração

**Lembre-se**: As variáveis só funcionam após um novo deploy! 🚀