# Pattern Frontend

Este documento define o padrao alvo do `linkbuds-web`.

Quando houver conflito entre:

- o estado atual do repositorio
- documentacoes antigas
- exemplos legados no codigo

este documento deve ser tratado como referencia para novas implementacoes.

## Estrutura principal

Dentro de `src`, a arquitetura principal e composta por tres camadas:

- `app`: comportamento, integracao, cache, roteamento, store e modulos de
  negocio
- `resources`: paginas, views e componentes visuais da aplicacao
- `shared`: reuso global, utilitarios, constantes, estilos e tipagens

Fora de `src`, vale considerar:

- `public`: assets estaticos
- `scripts`: automacoes internas
- `docs`: documentacao de padroes e organizacao

## Direcao de dependencias

As dependencias entre camadas devem seguir esta direcao:

- `resources` pode consumir `app` e `shared`
- `app` pode consumir `shared`
- `shared` deve permanecer neutro e nao deve depender de `app` ou `resources`

Regras complementares:

- `resources/components/ui` nao deve conter regra de negocio
- regras de negocio devem ficar em `app/modules`
- componentes reutilizaveis e compostos devem subir para
  `resources/components/base`
- primitives visuais devem viver em `resources/components/ui`

## Nomes de pastas

Todas as novas pastas devem usar `lowercase` ou `kebab-case`.

Padroes esperados:

- camadas e pastas tecnicas: `app`, `resources`, `shared`, `router`, `store`
- dominios e features: `orders`, `reseller-projects`, `enterprise-plans`
- agrupadores de componente: `theme-mode-toggle`, `table-orders`
- estruturas locais: `components`, `views`, `schemas`, `tests`

Nao usar `PascalCase` para nome de pasta em novas implementacoes.

## Nomes de arquivos

Os nomes de arquivos devem usar `kebab-case` com sufixos semanticamente fortes.

Padroes:

- pagina: `*.page.tsx`
- view: `*.view.tsx`
- componente local: `*.component.tsx`
- hook: `use-*.ts`
- hook de componente local: `use-*.component.ts`
- hook de pagina: `use-*.page.ts`
- use case: `*.use-case.ts`
- service: `*.service.ts`
- keys: `*.keys.ts`
- types: `*.types.ts`
- constants: `*.constants.ts`
- utilitario: `*.util.ts`
- schema: `*.schema.ts`
- validacao: `*.validation.ts`
- teste: `*.test.ts` e `*.test.tsx`
- barrel export: `index.ts`

Regras para `index.ts`:

- usar apenas quando ajudar a consolidar pontos de entrada
- sempre fazer exports explicitos
- nunca usar `export *`

Regras para testes:

- arquivos de teste nunca devem ficar soltos ao lado de arquivos de producao
- todo teste deve viver dentro de uma pasta `tests/`
- a pasta `tests/` pode existir no contexto da feature, pagina, componente ou
  na raiz tecnica daquela area, quando fizer mais sentido

## Pattern por camada

### `src/app`

`app` concentra detalhes tecnicos e comportamento da aplicacao:

- `api/`: cliente HTTP e integracoes externas
- `cache/`: wrappers e configuracoes de cache
- `config/`: leitura de ambiente e normalizacao de configuracao
- `middlewares/`: protecoes e regras transversais de navegacao
- `providers/`: providers globais
- `router/`: definicao central de rotas
- `store/`: estado cliente
- `modules/`: dominios de negocio

Padrao alvo para modulos:

```text
src/app/modules/<feature>
├── hooks
├── keys
├── service
├── types
└── use-cases
```

Regras do modulo:

- `hooks/` so deve existir quando houver hooks especificos do dominio
- `keys/` concentra chaves de cache e identificadores do modulo
- `service/` concentra comunicacao com API e integracoes do dominio
- `types/` concentra contratos e tipos do modulo
- `use-cases/` expoe hooks orientados a acao, leitura e mutacao

### `src/resources`

`resources` concentra a camada visual da aplicacao:

- `components/ui/`: primitives visuais
- `components/base/`: componentes compostos e reutilizaveis
- `pages/`: paginas, views, schemas, testes e componentes locais
- `main.tsx`: bootstrap da interface

Padrao alvo para paginas:

```text
src/resources/pages/<feature>
├── <feature>.page.tsx
├── use-<feature>.page.ts
├── components
├── views
├── schemas
└── tests
```

Regras da pagina:

- `*.page.tsx` orquestra a tela
- `use-*.page.ts` existe apenas quando a pagina tiver logica propria
- `components/` guarda pecas locais da pagina
- `views/` concentra etapas, variacoes ou recortes maiores da tela
- `schemas/` concentra schemas locais do fluxo
- `tests/` concentra todos os testes locais da pagina
- arquivos de teste nao devem ficar soltos na raiz da pagina ou do componente

### `src/shared`

`shared` concentra reuso global e neutro:

- `constants/`: constantes globais
- `enums/`: enumeracoes compartilhadas
- `hooks/`: hooks genericos
- `lib/`: helpers pequenos e utilitarios de base
- `styles/`: estilos globais
- `types/`: tipagens compartilhadas
- `utils/`: utilitarios reutilizaveis

Se um codigo depender de regra de negocio ou de uma tela especifica, ele nao
deve entrar em `shared`.

## Regra para componentes locais dentro de `pages`

Use esta regra sempre que criar componentes locais em
`src/resources/pages/<feature>/components`.

### Sem logica propria

Quando o componente for apenas visual ou receber toda a logica por props,
manter o arquivo direto:

```text
status-badge.component.tsx
```

### Com logica propria

Quando o componente tiver estado, hooks, efeitos, derivacoes ou manipuladores
proprios, criar uma pasta para agrupar o componente e sua logica:

```text
advanced-filter/
├── advanced-filter.component.tsx
└── use-advanced-filter.component.ts
```

Regras adicionais:

- a logica do componente deve ficar no hook local
- o componente deve ficar focado em renderizacao e composicao
- se o componente passar a ser reaproveitado em mais de uma pagina, avaliar
  mover para `resources/components/base`
- se ele for um primitive visual generico, mover para `resources/components/ui`

### O que vai para o hook

Sinal de que o componente ja pede pasta + hook (qualquer um basta):

- `useState`, `useRef`, `useEffect` ou `useMemo` proprios
- chamada de use-case/mutation (`use*UseCase`, `use*Mutations`) ou `useSession`
- handlers com mais de uma linha (`submit`, `confirmAction` + mutate, validacao)
- derivacoes de dados (filtros, `find`, totais, mensagens montadas)

O hook (`use-<nome>.component.ts`, sem JSX) devolve valores prontos e handlers;
o componente so desestrutura e renderiza. Constantes e funcoes puras usadas so
pela logica (ex.: `validate`, estado inicial do formulario) moram no hook.

```text
billing-section/
├── billing-section.component.tsx      -> JSX + subcomponentes visuais
└── use-billing-section.component.ts   -> estado, queries, mutations, handlers
```

Referencias no codigo: `settings/components/billing-section`,
`settings/components/subscribe-dialog`,
`link-pages/components/welcome-plans-dialog`.

## Corrigir o legado ao mexer (obrigatorio)

Muitos componentes atuais ainda misturam logica e renderizacao num arquivo so.
Nao e preciso migrar tudo de uma vez, mas:

- **todo componente novo** ja nasce no padrao (arquivo direto sem logica,
  pasta + hook com logica)
- **ao alterar um componente fora do padrao**, migrar ele na mesma mudanca:
  criar a pasta, mover o arquivo, extrair o hook e atualizar imports e testes
- a migracao nao muda comportamento: os testes existentes devem passar sem
  alteracao alem do caminho de import
- ao revisar codigo, componente tocado e nao migrado e motivo de ajuste

## Boas praticas

- novas regras de negocio entram em `app/modules/<feature>`
- novas telas entram em `resources/pages/<feature>`
- componentes reutilizaveis sobem para `resources/components/base`
- primitives sem regra de negocio entram em `resources/components/ui`
- usar alias `@/` para imports absolutos
- manter `shared` neutro e sem acoplamento a features
- preferir `function` para funcoes nomeadas exportadas
- usar `const` para callbacks locais, handlers inline e closures pequenas
- manter exports explicitos em `index.ts`
- manter todos os testes dentro de pastas `tests/`, por contexto ou por raiz
  tecnica

## O que nao usar como referencia

Os itens abaixo podem existir hoje no repositorio, mas nao devem servir como
padrao para novas implementacoes:

- `src/components` como camada paralela de componentes
- diretorios em `PascalCase`, como alguns casos em `src/layouts`
- organizacoes que misturam logica e renderizacao no mesmo componente quando a
  logica ja pede um hook local
- wildcard exports com `export *`

## Resumo rapido

- `app` = comportamento e integracao
- `resources` = interface e composicao visual
- `shared` = reuso global
- nomes em `kebab-case` com sufixos claros
- regra local de componente: arquivo direto sem logica, pasta com hook quando
  houver logica propria
- mexeu em componente fora do padrao: migra na mesma mudanca
