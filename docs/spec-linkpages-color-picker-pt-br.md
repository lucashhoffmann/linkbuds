---
title: 'Color picker e localização PT-BR das LinkPages'
type: 'feature'
created: '2026-09-19'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '64bb065fe7386f273443e76cb0a708a6b0e039d8'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** O editor usa seletores de cor nativos e ainda mistura termos em inglês; a página pública também expõe links de rodapé em inglês para um público brasileiro.

**Approach:** Criar um seletor de cor HEX reutilizável, inspirado na interação do Color Picker do shadcn.io, e aplicar PT-BR a todos os textos visíveis das LinkPages sem alterar o contrato da API nem os layouts públicos já responsivos.

## Boundaries & Constraints

**Always:** Manter cores no formato HEX opaco e em maiúsculas; preservar autosave e atualização imediata de links; manter acessibilidade por rótulo e teclado; usar as dependências existentes.

**Ask First:** Adicionar suporte a transparência, RGB/HSL como formato persistido, conta-gotas ou mudanças nos dados e layouts públicos.

**Never:** Alterar API, rastreamento, domínio personalizado, os três layouts de renderização ou adicionar dependência de cores.

## I/O & Edge-Case Matrix

| Scenario       | Input / State                               | Expected Output / Behavior                                        | Error Handling                                 |
| -------------- | ------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| Escolha de cor | Usuário altera cor do fundo, texto ou borda | Componente emite HEX válido em maiúsculas e a prévia é atualizada | Entrada HEX inválida não substitui a cor atual |
| Página pública | Rodapé LinksBuds visível                    | Ações auxiliares aparecem em PT-BR                                | N/A                                            |

</frozen-after-approval>

## Code Map

- `src/resources/components/ui/color-picker.tsx` -- seletor HEX reutilizável.
- `src/resources/pages/link-pages/link-page-edit.page.tsx` -- integra o seletor e localiza o editor.
- `src/resources/pages/link-pages/renderer/link-page-renderer-parts.tsx` -- localiza o rodapé público.
- `src/resources/pages/link-pages/tests/*.test.tsx` -- cobre seleção de cor e textos públicos.

## Tasks & Acceptance

**Execution:**

- [x] `src/resources/components/ui/color-picker.tsx` -- adicionar popover controlado com amostra, paleta e campo HEX validado.
- [x] `src/resources/pages/link-pages/link-page-edit.page.tsx` -- substituir os três inputs nativos e traduzir os textos visíveis do editor.
- [x] `src/resources/pages/link-pages/renderer/link-page-renderer-parts.tsx` -- traduzir os links auxiliares do rodapé público.
- [x] `src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx` e testes públicos -- validar o novo fluxo e os textos em português.

**Acceptance Criteria:**

- Given uma LinkPage em edição, when a pessoa escolhe uma cor, then a prévia e a persistência recebem HEX opaco em maiúsculas.
- Given uma LinkPage pública com rodapé LinksBuds, when a visitante a abre, then vê “Denunciar · Privacidade” e “Mais do LinksBuds”.
- Given o editor, when uma pessoa navega pelas seções, then não vê rótulos visíveis em inglês.

## Verification

**Commands:**

- `pnpm test -- src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx src/resources/pages/link-pages/tests/link-page-renderer.component.test.tsx src/resources/pages/link-pages/tests/public-link-page.page.test.tsx` -- expected: sucesso.
- `pnpm typecheck` -- expected: sucesso.

## Suggested Review Order

**Seleção de cores**

- Centraliza paleta e validação HEX sem ampliar o contrato de cores.
  [`color-picker.tsx:30`](../src/resources/components/ui/color-picker.tsx#L30)

- Reúsa o seletor nos três caminhos de edição e mantém o autosave existente.
  [`link-page-edit.page.tsx:420`](../src/resources/pages/link-pages/link-page-edit.page.tsx#L420)

- Aplica a cor do plano de fundo diretamente na prévia persistida.
  [`link-page-edit.page.tsx:1136`](../src/resources/pages/link-pages/link-page-edit.page.tsx#L1136)

**Experiência PT-BR**

- Localiza as seções principais e contagens do painel de edição.
  [`link-page-edit.page.tsx:96`](../src/resources/pages/link-pages/link-page-edit.page.tsx#L96)

- Localiza o rodapé que aparece para visitantes da página pública.
  [`link-page-renderer-parts.tsx:400`](../src/resources/pages/link-pages/renderer/link-page-renderer-parts.tsx#L400)

**Cobertura**

- Confirma normalização HEX e bloqueia entradas inválidas.
  [`link-page-edit.page.test.tsx:362`](../src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx#L362)

- Confirma os textos PT-BR na renderização pública.
  [`public-link-page.page.test.tsx:109`](../src/resources/pages/link-pages/tests/public-link-page.page.test.tsx#L109)
