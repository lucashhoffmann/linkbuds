---
title: 'Editor de links em modal responsivo'
type: 'feature'
created: '2026-09-19'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: 'c5e2035b2896fd0b810265582a52f000beab9dfe'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A criação de links, os controles de estilo e as ações de cada link ocupam a mesma linha do editor. Em larguras intermediárias e móveis, os campos e controles ficam comprimidos, tornando a leitura e a interação difíceis.

**Approach:** Concentrar a criação e a edição visual de links em um modal central, com campos empilhados e rolagem própria em telas baixas. A lista deve permanecer um resumo legível, com ações claras para editar, reordenar e remover.

## Boundaries & Constraints

**Always:** Reutilizar o componente `Dialog` existente; manter os dados, mutações, cores padrão, arrastar para reordenar, contagem de cliques e acessibilidade por teclado; funcionar de 320 px a desktop sem overflow horizontal; preservar as alterações não relacionadas já presentes no repositório.

**Ask First:** Alterar o contrato da API, adicionar novos tipos de link ou redes sociais, mudar regras de validação da URL/WhatsApp, ou converter também os fluxos de redes sociais e imagens em modais.

**Never:** Adicionar dependências, alterar a prévia pública, remover a opção de estilizar cores/borda, ou persistir alterações de edição antes de a pessoa confirmar no modal.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Criar link | Pessoa aciona “Adicionar link” e preenche rótulo, destino, posição e estilo | Modal central salva um link com os mesmos defaults e fecha ao concluir | Campos nativos obrigatórios impedem envio incompleto; modal continua aberto |
| Criar WhatsApp | Pessoa troca o tipo para WhatsApp | Campo de destino indica número com DDD e aplica os defaults atuais do WhatsApp | Não envia URL para um contato nem contato para um link comum |
| Editar link | Pessoa abre “Editar” em um item existente | Modal pré-preenchido permite alterar rótulo, posição, destino e estilo; a lista reflete a confirmação | Cancelar ou fechar não chama atualização nem altera a lista |
| Tela estreita | Largura de 320 px ou altura reduzida | Modal cabe na viewport, rola internamente e botões ficam alcançáveis; cada linha da lista não comprime conteúdo | N/A |
| Lista longa | Muitos links com URLs extensas | Rótulo e detalhe truncam sem estourar; arrastar, editar e remover continuam acessíveis | N/A |

</frozen-after-approval>

## Code Map

- `src/resources/pages/link-pages/link-page-edit.page.tsx` -- contém criação, estilização, lista, reordenação e ações dos links.
- `src/resources/components/ui/dialog.tsx` -- modal Radix já centralizado, com overlay, foco e layout móvel reutilizáveis.
- `src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx` -- mocks e cobertura do editor, criação, estilo e prévia.

## Tasks & Acceptance

**Execution:**

- [x] `src/resources/pages/link-pages/link-page-edit.page.tsx` -- substituir o formulário horizontal de criação por botão e modal central; mover a edição de conteúdo e aparência dos itens existentes para o mesmo padrão; simplificar as linhas para resumo, reordenação e ações responsivas.
- [x] `src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx` -- adaptar a criação existente e cobrir abertura, submissão e cancelamento do modal de edição, incluindo defaults do WhatsApp.

**Acceptance Criteria:**

- Given o editor de uma LinkPage, when a pessoa escolhe adicionar um link, then encontra um formulário central legível que não comprime campos em mobile.
- Given um link existente, when a pessoa escolhe editar, then pode ajustar conteúdo, posição e estilo em um modal pré-preenchido e a atualização só é enviada ao confirmar.
- Given a pessoa fecha ou cancela a edição, when retorna à lista, then o item mantém seus valores anteriores e nenhuma mutação de atualização é enviada.
- Given links com nomes ou destinos longos, when a página é visualizada em tela estreita, then o conteúdo não gera overflow horizontal e as ações permanecem utilizáveis.
- Given um WhatsApp novo, when a pessoa o salva, then a mutação mantém os valores padrão atuais de cor, borda e tipo de contato.

## Design Notes

O modal é a única superfície de formulário para links: uma ação “Adicionar link” cria um rascunho; “Editar” cria uma cópia do item existente. Isso evita estado parcial na lista e conserva a mutação existente como ponto único de persistência. O conteúdo deve usar uma coluna, com as cores em grade apenas quando houver espaço; o rodapé empilha ações no mobile e as alinha à direita em telas maiores.

## Verification

**Commands:**

- `pnpm test -- src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx` -- os fluxos de criar, editar, cancelar e defaults passam.
- `pnpm typecheck` -- TypeScript sem erros.
- `pnpm lint src/resources/pages/link-pages/link-page-edit.page.tsx src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx` -- regras de qualidade passam nos arquivos alterados.

## Suggested Review Order

**Fluxo do modal**

- Centraliza rascunho, confirmação e persistência somente após sucesso.
  [`link-page-edit.page.tsx:620`](../src/resources/pages/link-pages/link-page-edit.page.tsx#L620)

- Mantém os campos utilizáveis em viewport baixa e evita dependência do combobox pendente.
  [`link-page-edit.page.tsx:765`](../src/resources/pages/link-pages/link-page-edit.page.tsx#L765)

**Lista responsiva**

- Deixa apenas resumo, arrastar e ações essenciais visíveis por item.
  [`link-page-edit.page.tsx:920`](../src/resources/pages/link-pages/link-page-edit.page.tsx#L920)

**Cobertura**

- Confirma criação modal e mantém o payload de criação existente.
  [`link-page-edit.page.test.tsx:284`](../src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx#L284)

- Confirma que erro de salvamento conserva o rascunho e a lista persistida.
  [`link-page-edit.page.test.tsx:419`](../src/resources/pages/link-pages/tests/link-page-edit.page.test.tsx#L419)
