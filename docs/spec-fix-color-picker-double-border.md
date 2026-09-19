---
title: 'Corrigir borda dupla do seletor de cor'
type: 'bugfix'
created: '2026-09-19'
status: 'done'
route: 'one-shot'
---

# Corrigir borda dupla do seletor de cor

## Intent

**Problem:** O seletor de cor era envolvido por um segundo contêiner com borda, resultando em uma caixa dupla.

**Approach:** Remover o contêiner redundante e preservar o próprio `ColorPicker` como o único campo visual.

## Suggested Review Order

- Remove a borda externa redundante sem alterar a integração ou persistência da cor.
  [`link-page-edit.page.tsx:420`](../src/resources/pages/link-pages/link-page-edit.page.tsx#L420)
