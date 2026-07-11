# GlowStack — Guia Técnico de Testes

## 1. Visão geral

Este guia documenta a estratégia de testes automatizados do projeto GlowStack para servir como referência de engenharia em:

- novas implementações,
- manutenção de funcionalidades,
- refatorações com segurança.

Stack de testes adotada:

- **Backend:** Jest + Supertest
- **Frontend:** Vitest + Testing Library + jsdom

---

## 2. Estrutura de testes

## 2.1 Backend

- Configuração: `backend/jest.config.cjs`
- Testes:
  - `backend/__tests__/api.test.js`
  - `backend/src/middlewares/authMiddleware.test.js` (Vitest legado, revisar convergência futura)
- Ponto de composição da aplicação:
  - `backend/src/appFactory.js`:
    - `createApp()` (testável)
    - `startServer()` (produção)

### Padrão recomendado (backend)

- Isolar dependências externas via mock (`db`, `stripe`, `email`)
- Testar cenários de:
  - validação de payload,
  - sucesso,
  - exceções de infraestrutura,
  - regras de negócio críticas (estoque, autenticação, webhook)

---

## 2.2 Frontend

- Configuração: `frontend/vitest.config.ts`
- Setup global: `frontend/src/test/setup.ts`
- Testes existentes:
  - `src/contexts/cartInventory.test.ts`
  - `src/pages/home/priceFilter.test.ts`
  - `src/services/productsService.test.ts`
  - `src/hooks/useProducts.test.tsx`

### Padrão recomendado (frontend)

- Serviços: testar com mocks dos SDKs externos (Firebase/HTTP)
- Hooks: testar ciclo de estado (`loading`, `success`, `error`) com `renderHook`
- Componentes: priorizar cenários de comportamento e acessibilidade (não implementação interna)

---

## 3. Como executar

## 3.1 Backend

```bash
cd GlowStack/backend
npm test
```

Cobertura é gerada automaticamente conforme `jest.config.cjs`.

## 3.2 Frontend

```bash
cd GlowStack/frontend
npm run test
npm run coverage
```

Artefatos de cobertura:
- `GlowStack/frontend/coverage/` (html/lcov/text)

---

## 4. Convenções de escrita de teste

1. Nome do teste descreve comportamento observado.
2. Um cenário por teste (Given/When/Then implícito).
3. Evitar acoplamento com implementação interna.
4. Mockar fronteiras externas, não regras de negócio internas.
5. Falhas devem produzir mensagens legíveis para debugging.

---

## 5. Evolução recomendada da suíte

## Curto prazo
- Cobrir `checkoutRoutes` para erro interno e cupom inválido no Stripe.
- Cobrir `webhookRoutes` para falha transacional com rollback lógico.
- Unificar framework de teste do backend (Jest ou Vitest, evitar mistura em novos casos).

## Médio prazo
- Testes de integração frontend (fluxos reais):
  - catálogo → carrinho → checkout
  - login → área admin
- Mocks de rede centralizados para reduzir repetição.

## Longo prazo (CI/CD)
- Pipeline com quality gates:
  - cobertura mínima frontend e backend,
  - bloqueio de merge em falha de teste,
  - publicação dos relatórios de cobertura como artefato.

---

## 6. Troubleshooting

## Erro: `test property does not exist in vite.config.ts`
- Causa: tipagem do Vite sem extensão do Vitest.
- Solução aplicada: separar `vitest.config.ts` do `vite.config.ts`.

## Erro: `Cannot access mock before initialization`
- Causa: hoisting de `vi.mock`.
- Solução: declarar mocks com `vi.hoisted`.

## Erro backend Firebase (`credential.cert is not a function`)
- Causa: import incorreto do SDK admin.
- Solução aplicada:
  - `import { initializeApp, cert } from "firebase-admin/app"`
  - `credential: cert(serviceAccount)`

---

## 7. Resultado técnico desta fase

A base de testes foi estruturada para suportar crescimento incremental com baixo acoplamento e documentação rastreável, estabelecendo uma fundação consistente para evolução contínua da qualidade no GlowStack.
