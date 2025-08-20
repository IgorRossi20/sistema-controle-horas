# 🔥 Solução para Erros de Índices do Firestore

## 🚨 Problema Identificado

Após configurar as variáveis de ambiente no Vercel, o Firebase está conectando corretamente, mas agora aparece um novo erro:

```
Erro ao buscar projetos: FirebaseError: The query requires an index
```

## 🔍 Análise Técnica

**Consulta que está falhando:**
```javascript
const q = query(
  collection(db, 'projects'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
)
```

**Problema:** O Firestore precisa de um índice composto para consultas que combinam `where` + `orderBy` em campos diferentes.

## ✅ Solução Passo a Passo

### 1. Criar Índice via Console Firebase

**Opção A - Link Direto (Recomendado):**
1. Copie o link que aparece no erro do console
2. Cole no navegador e faça login no Firebase
3. Clique em "Create Index"
4. Aguarde a criação (pode levar alguns minutos)

**Opção B - Manual:**
1. Acesse: https://console.firebase.google.com
2. Selecione o projeto: `controlehoras-1d95d`
3. Vá em **Firestore Database** → **Indexes**
4. Clique em **Create Index**
5. Configure:
   - **Collection ID:** `projects`
   - **Fields:**
     - Campo 1: `userId` (Ascending)
     - Campo 2: `createdAt` (Descending)
   - **Query scope:** Collection
6. Clique em **Create**

### 2. Atualizar Arquivo de Índices Local

Adicione ao `firestore.indexes.json`:

```json
{
  "collectionGroup": "projects",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### 3. Verificar Status do Índice

1. No Console Firebase → Firestore → Indexes
2. Aguarde o status mudar de "Building" para "Enabled"
3. Isso pode levar de 2-10 minutos

### 4. Testar a Aplicação

1. Recarregue a página da aplicação
2. Verifique se o erro desapareceu
3. Teste a funcionalidade de projetos

## 🛠️ Índices Necessários Completos

Para evitar problemas futuros, certifique-se de que estes índices existem:

### Para Projetos:
```json
{
  "collectionGroup": "projects",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### Para Clientes:
```json
{
  "collectionGroup": "clients",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### Para Entradas de Tempo:
```json
{
  "collectionGroup": "timeEntries",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```

## ⚠️ Pontos Importantes

1. **Tempo de Criação:** Índices podem levar alguns minutos para serem criados
2. **Não Deletar:** Nunca delete índices em produção sem verificar dependências
3. **Monitoramento:** Verifique regularmente o uso de índices no Console Firebase
4. **Custos:** Índices consomem armazenamento, mas são essenciais para performance

## 🔄 Próximos Passos

1. ✅ Criar índice para projetos (userId + createdAt)
2. ⏳ Aguardar criação do índice
3. 🧪 Testar funcionalidade
4. 📝 Documentar solução
5. 🚀 Verificar se outros índices são necessários

## 📞 Em Caso de Problemas

Se o erro persistir após criar o índice:

1. Verifique se o índice está "Enabled" no Console
2. Limpe o cache do navegador
3. Verifique se as regras do Firestore permitem leitura
4. Confirme se o userId está sendo passado corretamente

---

**Status:** 🔄 Aguardando criação do índice no Console Firebase