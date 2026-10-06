# linkbuds-web

Frontend React/Vite para o projeto LinkBuds.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Por padrao, `VITE_APP_URL_ROOT` deve apontar para a API Nest em
`http://localhost:3030`.

## Scripts

- `pnpm dev`: inicia o Vite.
- `pnpm build`: valida TypeScript e gera build.
- `pnpm typecheck`: valida os projetos TS.
- `pnpm lint`: executa ESLint.
- `pnpm test`: executa Vitest.

## Documentação

- Produto, estado e decisões: `../docs/README.md`
- Padrões de código do front: `docs/folder-structure.md`, `docs/pattern.md`
