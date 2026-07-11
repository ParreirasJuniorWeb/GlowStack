# GlowStack — Checklist Técnico de QA Responsivo (Manual)

## Objetivo
Validar comportamento responsivo e usabilidade visual após implementação de navbar responsiva e para continuidade de hardening de UI.

## Breakpoints sugeridos
- Mobile: 360x800 e 390x844
- Tablet: 768x1024
- Desktop: 1280x800 e 1440x900

---

## 1) Header / Navbar (implementado)

### Mobile (<768px)
- [ ] Logo aparece alinhada à esquerda.
- [ ] Botão hambúrguer aparece à direita.
- [ ] Clique no hambúrguer abre menu vertical.
- [ ] Clique novamente fecha menu.
- [ ] Links do menu funcionam (Todos, Pele, Lábios, Olhos, Skincare, Meus Pedidos).
- [ ] Ao clicar em item, menu mobile fecha automaticamente.
- [ ] Botões de ação no menu mobile funcionam:
  - [ ] Entrar (quando deslogado)
  - [ ] Carrinho
  - [ ] Admin/Sair (quando logado)
- [ ] Estados de hover/focus visíveis e suaves.
- [ ] Sem overflow horizontal.

### Desktop (>=768px)
- [ ] Menu hambúrguer oculto.
- [ ] Links em linha horizontal com alinhamento correto.
- [ ] Ações de sessão/carrinho/admin visíveis e alinhadas.
- [ ] Hover de links e botões está consistente.
- [ ] Header mantém `max-w-7xl` centralizado (`mx-auto`).

---

## 2) Navegação e acessibilidade
- [ ] `aria-expanded` muda corretamente ao abrir/fechar menu.
- [ ] `aria-controls` aponta para o menu mobile.
- [ ] Navegação por teclado (Tab/Shift+Tab/Enter/Esc) sem travas.
- [ ] Sem elementos clicáveis escondidos sobrepostos.

---

## 3) Regressão visual global
- [ ] Home renderiza sem quebra de layout.
- [ ] Cart não sobrepõe indevidamente o header em mobile.
- [ ] ProductDetails mantém legibilidade em telas pequenas.
- [ ] Orders mantém espaçamento e tipografia em mobile.
- [ ] AdminDashboard não causa overflow em tablet.

---

## 4) Evidências para relatório
Registrar:
- prints em cada breakpoint;
- lista de falhas com severidade (Alta/Média/Baixa);
- URL/rota afetada;
- passos de reprodução;
- resultado esperado vs atual.

---

## 5) Resultado técnico atual (automação já executada)
- `npm run test`: ✅ 4 arquivos / 11 testes passando
- `npm run build`: ✅ build de produção concluído
- Observação: há warning de chunk grande no build (otimização futura por code splitting).
