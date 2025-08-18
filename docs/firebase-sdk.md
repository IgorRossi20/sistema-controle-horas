# Guia de Uso do SDK Modular do Firebase

## Introdução

Este projeto utiliza o SDK Modular do Firebase, que oferece vantagens como:

- **Redução do tamanho do bundle**: importa apenas os módulos necessários
- **Tree-shaking eficiente**: elimina código não utilizado
- **Melhor performance**: carrega apenas o que é necessário para a aplicação

## Módulos Implementados

Atualmente, o projeto utiliza os seguintes módulos do Firebase:

- **Authentication**: para autenticação de usuários
- **Firestore**: para armazenamento de dados
- **Analytics**: para análise de uso da aplicação

## Como Usar

### Importação de Módulos

Para usar um serviço do Firebase, importe-o diretamente do pacote específico:

```javascript
// Importações corretas usando o SDK modular
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';
```

### Exemplo de Uso do Authentication

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../main';

// Usando o serviço de autenticação
async function fazerLogin(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}
```

### Exemplo de Uso do Firestore

```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../main';

// Usando o serviço Firestore
async function adicionarDocumento(colecao, dados) {
  try {
    const docRef = await addDoc(collection(db, colecao), {
      ...dados,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    throw error;
  }
}
```

### Exemplo de Uso do Analytics

```javascript
import { logEvent } from 'firebase/analytics';
import { analytics } from '../main';

// Usando o serviço Analytics
function registrarEvento(nomeEvento, parametros = {}) {
  logEvent(analytics, nomeEvento, parametros);
  console.log(`Evento registrado: ${nomeEvento}`, parametros);
}

// Exemplo de registro de visualização de página
function registrarVisualizacaoPagina(nomePagina) {
  registrarEvento('page_view', {
    page_title: nomePagina,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
}

// Exemplo de registro de navegação entre páginas
function registrarNavegacao(paginaOrigem, paginaDestino) {
  registrarEvento('navigation', {
    from_page: paginaOrigem,
    to_page: paginaDestino
  });
}
```

## Adicionando Novos Serviços

Para adicionar um novo serviço do Firebase:

1. Importe o serviço no arquivo `main.js`:

```javascript
import { getNewService } from 'firebase/new-service';
```

2. Inicialize o serviço:

```javascript
const newService = getNewService(firebaseApp);
```

3. Exporte o serviço para uso em outros componentes:

```javascript
export { db, auth, analytics, newService };
```

4. Importe e use o serviço em seus componentes conforme necessário.

## Configuração de Variáveis de Ambiente

As credenciais do Firebase são armazenadas em variáveis de ambiente no arquivo `.env`:

```
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id  # Necessário para Analytics
```

## Eventos de Analytics Implementados

O projeto atualmente rastreia os seguintes eventos:

- **page_view**: Visualização de páginas (Dashboard, Relatórios, etc.)
- **navigation**: Navegação entre páginas da aplicação
- **button_click**: Cliques em botões específicos
- **login**: Autenticação de usuário
- **logout**: Saída do usuário
- **create_item**: Criação de novos registros (clientes, projetos, etc.)
- **delete_item**: Exclusão de registros

## Recursos Adicionais

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Guia do SDK Modular](https://firebase.google.com/docs/web/modular-upgrade)
- [Referência da API Web v9](https://firebase.google.com/docs/reference/js)
- [Documentação do Google Analytics para Firebase](https://firebase.google.com/docs/analytics)