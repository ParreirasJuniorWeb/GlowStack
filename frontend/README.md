# 💄 GlowStack | Premium E-Commerce Platform

[![React](https://shields.io)](https://react.dev)
[![TypeScript](https://shields.io)](https://typescriptlang.org)
[![Node.js](https://shields.io)](https://nodejs.org)
[![Firebase](https://shields.io)](https://google.com)
[![Stripe](https://shields.io)](https://stripe.com)
[![Tailwind CSS](https://shields.io)](https://tailwindcss.com)

> **GlowStack** é um mini e-commerce de maquiagem de alta performance e arquitetura resiliente de ponta a ponta. Desenvolvido com **React + TypeScript** no frontend e um backend modular em **Node.js + Express**, integrado ao ecossistema do **Firebase (Auth, Firestore, Storage)** e ao gateway de pagamentos **Stripe (Checkout Sessions & Webhooks Async)**.

---

## 🏗️ Decisões Arquiteturais & Padrões de Projeto

O projeto foi estruturado seguindo rigorosamente os princípios de **Clean Code**, **SOLID** e separação clara de responsabilidades (*SoC*), mitigando o acoplamento e garantindo a escalabilidade.

### Frontend (React + TypeScript)
*   **Separation of Concerns (SoC):** Divisão estrita em três camadas principais:
    *   **Services:** Responsável exclusiva por requisições HTTP e comunicação direta com SDKs (Firebase/Stripe), mantendo a lógica de rede isolada.
    *   **Custom Hooks:** Abstração de regras de negócio, controle de estados complexos (como reações ao estoque) e gerenciamento de efeitos colaterais.
    *   **Components:** Camada visual burra (*stateless/presentational*), focada puramente na renderização e experiência do usuário (UX).
*   **Estado Global Centralizado (React Context API):** Gerenciamento unificado de sessões (`AuthContext`), gerenciamento síncrono do carrinho (`CartContext`) e filtros de navegação fluida (`FilterContext`).
*   **Fault Tolerance (Resiliência):** Implementação de **Error Boundaries assíncronos** (via `react-error-boundary`) acoplados a uma rota centralizada de telemetria, garantindo que falhas de rede ou de API nunca causem telas brancas ao usuário.
*   **Performance Optimization:** Uso estratégico de `useMemo`, `useCallback` e `React.memo` para evitar re-renderizações desnecessárias em grids dinâmicos de produtos e cartões expansivos de históricos.
*   **Strict Form Validation:** Formulários blindados utilizando **React Hook Form** e validação de esquemas em tempo real com **Zod**, garantindo tipagem estrita desde a entrada de dados.

### Backend (Node.js + Express)
*   **Modular Architecture (Anti-God File):** O ponto de entrada (`server.js`) atua puramente como orquestrador. A lógica do servidor foi distribuída em pastas funcionais: `src/config/` (inicializações singleton), `src/middlewares/` (interceptadores de segurança) e `src/routes/` (endpoints segmentados).
*   **Event-Driven & Async Processing (Webhooks):** Conclusão de pedidos baseada em eventos assíncronos disparados pelo Stripe (`checkout.session.completed` e `checkout.session.expired`), garantindo o fechamento e a auditoria das transações mesmo que o usuário feche o navegador.
*   **Data Consistency & Atomicity (Database Transactions):** O processamento de pedidos e a baixa de estoque na base de dados utilizam **Transactions do Firestore** (`db.runTransaction`), impedindo problemas de concorrência ou dados corrompidos (*overselling*).

---

## 🔒 Segurança de Nível de Produção

*   **JWT Server Authentication:** O painel de administração é blindado por um middleware customizado (`requireAdmin`). O React extrai o `IdToken` criptografado (JWT) gerado pelo Firebase Auth e o injeta no cabeçalho `Authorization: Bearer`. O backend descriptografa e valida o perfil administrativo antes de liberar mutações.
*   **Firestore Security Rules:** Políticas rígidas de acesso direto ao banco. A escrita na coleção de produtos (`products`) e logs de transação (`transaction_logs`) é bloqueada para a web (`allow write: if false`), delegando qualquer modificação crítica exclusivamente ao servidor Node (Admin SDK).
*   **Stripe Webhook Verification:** Validação da assinatura digital bruta (`stripe-signature` via *raw body*) das requisições recebidas no endpoint `/webhook`, impedindo que invasores forjem relatórios falsos de pagamentos aprovados.
*   **Brute Force Mitigation:** Estratégia de *Rate Limiting* no cliente controlando tentativas de acesso e capturando respostas de saturação nativas do Firebase Auth (`auth/too-many-requests`).
*   **Price Fraud Prevention:** O preço final nunca é lido do payload do cliente. O backend intercepta os IDs dos produtos, busca os valores reais salvos na base do Firestore e repassa o identificador imutável de preço (`stripePriceId`) ao gateway.

---

## 🛠️ Stack Tecnológica

### Frontend
*   **React 18** (Vite como bundler)
*   **TypeScript** (Strict Mode)
*   **Tailwind CSS** (Design Responsivo, Glassmorphism, Micro-interações)
*   **Lucide React** (Pacote de Ícones Semânticos)
*   **React Router DOM** (Navegação SPA)
*   **React Hook Form + Zod** (Stateful Forms & Schema Validation)
*   **React Error Boundary** (Tratamento de exceções na UI)

### Backend & Cloud Infrastructure
*   **Node.js & Express** (ES Modules)
*   **Firebase Authentication** (OAuth com Google e E-mail/Senha tradicional)
*   **Cloud Firestore** (NoSQL Database)
*   **Cloud Storage** (Armazenamento de Mídias/Upload Assíncrono)
*   **Stripe API & CLI** (Gateway Financeiro, Gestão de Eventos locais)
*   **Nodemailer** (Disparo automatizado de e-mails transacionais em HTML premium)
*   **Dotenv** (Gerenciamento seguro de variáveis de ambiente)

### Quality Assurance (Testes)
*   **Vitest** (Testes de unidade rápidos e mocks de SDKs do Firebase Admin)

---

## 📂 Estrutura de Diretórios do Projeto

### Frontend
```text
src/
├── components/          # Componentes visuais isolados (Header, ProductList, OrderCard...)
├── contexts/            # Provedores de estado global (Auth, Cart, Filter...)
├── hooks/               # Custom hooks de abstração lógica (useAuth, useCart, useOrders...)
├── pages/               # Páginas completas do app (ProductDetails, AdminDashboard, AuthPage...)
├── services/            # Camada de comunicação com APIs externa e Firebase SDK
├── types/               # Definições globais de interfaces TypeScript da aplicação
└── App.tsx              # Componente raiz e injetor de rotas
```

### Backend
```text
src/
├── config/              # Inicializações centralizadas (FirebaseAdmin, Stripe Singleton)
├── middlewares/         # Middlewares interceptores de rotas e segurança (requireAdmin)
├── routes/              # Endpoints REST segregados (admin, checkout, webhooks, logs)
└── server.js            # Ponto de entrada limpo e orquestrador do Express
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
*   Node.js instalado (v20 ou superior recomendada)
*   Uma conta no Firebase e no Stripe (modo de teste habilitado)
*   Stripe CLI instalado na sua máquina

### Passo 1: Configuração do Backend
1.  Navegue até a pasta do backend e instale as dependências:
    ```bash
    npm install
    ```
2.  Gere uma chave privada do Firebase (*Configurações do Projeto > Contas de Serviço > Gerar nova chave privada*) e salve o arquivo JSON na raiz do projeto backend com o nome `chave-privada-firebase.json`.
3.  Crie um arquivo `.env` na raiz do backend seguindo o modelo:
    ```env
    STRIPE_SECRET_KEY=sua_sk_test_aqui
    STRIPE_WEBHOOK_SECRET=sua_whsec_aqui (obtida no passo do stripe listen)
    FRONTEND_URL=http://localhost:5173
    PORT=3001
    SMTP_HOST=sandbox.smtp.mailtrap.io
    SMTP_PORT=2525
    SMTP_USER=seu_usuario
    SMTP_PASS=sua_senha
    ```
4.  (Opcional) Popule seu banco de dados rodando o script de seed corrigido para ES Modules:
    ```bash
    node seedProducts.js
    ```
5.  Inicialize o servidor em modo de desenvolvimento:
    ```bash
    npm run dev
    ```

### Passo 2: Configuração dos Webhooks locais (Stripe CLI)
1.  Em um novo terminal, efetue o login no Stripe:
    ```bash
    stripe login
    ```
2.  Inicie o redirecionamento dos eventos para a sua porta local:
    ```bash
    stripe listen --forward-to localhost:3001/webhook
    ```
3.  Copie o segredo gerado (`whsec_...`), cole no seu arquivo `.env` do backend e reinicie o servidor.
4.  Para testar o fluxo de cancelamento/expiração automatizado rodado via transação do Firestore:
    ```bash
    stripe trigger checkout.session.expired
    ```

### Passo 3: Configuração do Frontend
1.  Navegue até a pasta do frontend e instale as dependências:
    ```bash
    npm install
    ```
2.  Gere o build estático local para verificar a integridade da tipagem TypeScript e compilação do Tailwind CSS:
    ```bash
    npm run build
    ```
3.  Execute a aplicação localmente:
    ```bash
    npm run dev
    ```

---

## 🧪 Rodando os Testes Automatizados

O projeto conta com testes automatizados focados nas defesas críticas e regras de negócio complexas. Para rodar a suíte de testes com o **Vitest**:

```bash
# No diretório do Backend ou Frontend
npm run test
```

Os testes cobrem:
*   Validação estrita do bloqueio do middleware `requireAdmin` para requisições não autorizadas.
*   Cálculo e imposição lógica da trava de teto máximo de inventário no carrinho.
*   Comportamento estático previsível do filtro de preços dinâmico e seu mecanismo de reset.

---
Desenvolvido com foco em escalabilidade, segurança e excelência técnica por João Paulo. ✨
