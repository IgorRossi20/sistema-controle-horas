# Aplicativo de Controle de Horas Trabalhadas

Este é um aplicativo web simples para controle de horas trabalhadas, desenvolvido especificamente para prestadores de serviço PJ que precisam registrar suas horas e gerar relatórios mensais.

## Stack Tecnológica

### Frontend
- HTML5, CSS3 (com Bootstrap 5 para responsividade)
- JavaScript (Vue.js 3 - Composition API)
- Vite (para build e desenvolvimento)

### Backend e Banco de Dados
- Firebase (Autenticação, Firestore, Hosting)
- Sem necessidade de servidor próprio

### Bibliotecas Adicionais
- jsPDF (para exportação de relatórios em PDF)
- SheetJS (para exportação de relatórios em Excel)
- Chart.js (para visualizações gráficas de horas)

## Hospedagem
- Firebase Hosting (gratuito para projetos pequenos)

## Funcionalidades

- Cadastro de clientes e projetos
- Registro diário de horas (data, descrição, tempo trabalhado)
- Visualização mensal das horas com total acumulado
- Exportação para PDF ou Excel
- Interface responsiva e fácil de usar

## Estrutura do Projeto

```
/
├── public/              # Arquivos estáticos
├── src/
│   ├── assets/          # Imagens e recursos
│   ├── components/      # Componentes Vue reutilizáveis
│   ├── views/           # Páginas da aplicação
│   ├── services/        # Serviços (Firebase, exportação)
│   ├── store/           # Gerenciamento de estado
│   ├── router/          # Configuração de rotas
│   ├── App.vue          # Componente raiz
│   └── main.js          # Ponto de entrada
├── firebase.json        # Configuração do Firebase
├── package.json         # Dependências
└── vite.config.js       # Configuração do Vite
```

## Modelo de Dados

### Coleções no Firestore

#### Users
```
users/
  ├── {userId}/
  │   ├── name: string
  │   ├── email: string
  │   └── company: string
```

#### Clients
```
clients/
  ├── {clientId}/
  │   ├── name: string
  │   ├── userId: string (referência)
  │   └── createdAt: timestamp
```

#### Projects
```
projects/
  ├── {projectId}/
  │   ├── name: string
  │   ├── clientId: string (referência)
  │   ├── userId: string (referência)
  │   ├── description: string
  │   └── createdAt: timestamp
```

#### TimeEntries
```
timeEntries/
  ├── {entryId}/
  │   ├── userId: string (referência)
  │   ├── projectId: string (referência)
  │   ├── clientId: string (referência)
  │   ├── date: timestamp
  │   ├── description: string
  │   ├── hours: number
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
```

## Como Iniciar

1. Clone este repositório
2. Configure o Firebase (instruções abaixo)
3. Instale as dependências com `npm install`
4. Execute o servidor de desenvolvimento com `npm run dev`
5. Faça o build para produção com `npm run build`

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore e a Autenticação (com e-mail/senha)
3. Crie um arquivo `.env` na raiz do projeto com suas credenciais:

```
VITE_FIREBASE_API_KEY=seu-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-auth-domain
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

## Exportação de Relatórios

O aplicativo permite exportar relatórios em dois formatos:

- **PDF**: Utilizando a biblioteca jsPDF para gerar documentos formatados
- **Excel**: Utilizando a biblioteca SheetJS para criar planilhas detalhadas

## Licença

MIT