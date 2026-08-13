# Estrutura de Pastas

Este arquivo descreve a estrutura alvo do `linkbuds-web`.

Ele nao representa um espelho literal do estado atual do repositorio. O objetivo
e servir como modelo para novas features, refactors e organizacao futura.

## Raiz do projeto

```text
.
├── docs
│   ├── folder-structure.md
│   └── pattern.md
├── public
├── scripts
├── src
│   ├── app
│   ├── resources
│   └── shared
├── components.json
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Leitura:

- `docs/`: padroes e documentacao interna
- `public/`: assets estaticos
- `scripts/`: automacoes locais
- `src/`: codigo fonte principal

## Estrutura alvo de `src`

```text
src
├── app
│   ├── api
│   ├── cache
│   ├── config
│   ├── middlewares
│   ├── modules
│   ├── providers
│   ├── router
│   └── store
├── resources
│   ├── components
│   │   ├── base
│   │   └── ui
│   ├── pages
│   │   └── app.tsx
│   └── main.tsx
└── shared
    ├── constants
    ├── enums
    ├── hooks
    ├── lib
    ├── styles
    ├── types
    └── utils
```

Leitura:

- `app`: regras de aplicacao e comportamento
- `resources`: paginas e composicao visual
- `shared`: reuso global e neutro

## Estrutura canonica de modulo

```text
src/app/modules/<feature>
├── hooks
├── keys
│   └── <feature>.keys.ts
├── service
│   └── <feature>.service.ts
├── types
│   └── <feature>.types.ts
└── use-cases
    ├── index.ts
    └── use-<action>.use-case.ts
```

Regras:

- `hooks/` e opcional e so entra quando houver hooks especificos do dominio
- `use-cases/` concentra hooks de leitura, mutacao e fluxo do modulo
- `service/` fala com API ou integracoes externas do dominio
- `types/` e `keys/` ficam colocalizados com o modulo

## Estrutura canonica de pagina

```text
src/resources/pages/<feature>
├── <feature>.page.tsx
├── use-<feature>.page.ts
├── components
│   ├── status-badge.component.tsx
│   └── advanced-filter
│       ├── advanced-filter.component.tsx
│       └── use-advanced-filter.component.ts
├── views
│   └── create
│       ├── create.view.tsx
│       ├── create.schema.ts
│       └── use-create.ts
├── schemas
└── tests
```

Regras:

- `use-<feature>.page.ts` e opcional
- `views/`, `schemas/` e `tests/` entram apenas quando a feature precisar
- `components/` guarda apenas pecas locais da pagina
- arquivos de teste nunca ficam soltos; sempre entram em alguma pasta `tests/`

## Regra normativa para componentes locais

### Sem logica propria

```text
components/
└── status-badge.component.tsx
```

Use arquivo direto quando o componente:

- for apenas visual
- receber comportamento por props
- nao precisar de hook, estado ou efeito proprio

### Com logica propria

```text
components/
└── advanced-filter/
    ├── advanced-filter.component.tsx
    └── use-advanced-filter.component.ts
```

Use pasta propria quando o componente:

- tiver estado local
- tiver efeito, derivacao ou manipuladores proprios
- merecer separar renderizacao de logica

## Regra normativa para testes

```text
src/resources/pages/<feature>
├── components
├── schemas
└── tests
    ├── <feature>.page.test.tsx
    └── components
        └── advanced-filter.component.test.tsx
```

Regras:

- nenhum teste deve ficar solto fora de `tests/`
- `tests/` pode ser local ao contexto da feature ou representar a raiz tecnica
  daquela area
- componentes, paginas, schemas e hooks podem ter seus testes agrupados dentro
  da pasta `tests/` correspondente

## Onde cada coisa deve morar

```text
src/resources/pages
  -> usa components locais, base e ui
  -> consome hooks e use-cases de src/app/modules
  -> reaproveita constantes, tipos e utils de src/shared

src/resources/components/base
  -> componentes compostos e reutilizaveis da aplicacao

src/resources/components/ui
  -> primitives visuais sem regra de negocio

src/shared
  -> codigo neutro, sem dependencia de pagina ou dominio
```

## Notas de legado

Os itens abaixo podem existir hoje no repositorio, mas ficam fora da
estrutura-alvo:

- `src/components` como camada paralela
- `src/layouts` como raiz independente
- diretorios novos em `PascalCase`

Para novas implementacoes:

- nao adicionar componentes novos em `src/components`
- nao usar `src/layouts` como referencia para novas organizacoes
- preferir `resources/components/base` para shells e componentes compostos
