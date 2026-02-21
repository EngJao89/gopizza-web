# Go Pizza — Web

Aplicação web do **Go Pizza**, projeto de delivery de pizzas. Desenvolvida com Next.js (App Router), React 19 e TypeScript.

---

## Descrição do projeto

O **Go Pizza Web** é a interface front-end do sistema Go Pizza, voltada para o usuário final que deseja realizar pedidos de pizza. O projeto está em estágio inicial e utiliza o App Router do Next.js, preparado para evoluir com páginas de cardápio, carrinho e checkout.

---

## Como rodar o projeto

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm**, **yarn**, **pnpm** ou **bun**

### Instalação

```bash
# Clone o repositório (se ainda não tiver)
git clone <url-do-repositorio>
cd gopizza-web

# Instale as dependências
npm install
```

### Comandos disponíveis

| Comando        | Descrição                                      |
|----------------|------------------------------------------------|
| `npm run dev`  | Sobe o servidor de desenvolvimento em `http://localhost:3000` |
| `npm run build`| Gera o build de produção                       |
| `npm run start`| Sobe o servidor com o build de produção        |
| `npm run lint` | Executa o ESLint no código                     |
| `npm run commit` | Abre o Commitizen para commits convencionais |

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). A aplicação recarrega automaticamente ao editar os arquivos.

### Build e produção

```bash
npm run build
npm run start
```

---

## Decisões técnicas

- **Next.js 16** — Framework React com SSR, App Router e otimizações de performance; boa base para SEO e futuras APIs ou integrações.
- **React 19** — Versão atual do React com melhorias de performance e APIs modernas.
- **TypeScript** — Tipagem estática para menos erros em tempo de desenvolvimento e melhor manutenção.
- **Tailwind CSS v4** — Estilização utilitária com PostCSS; design system via variáveis CSS e tema (incluindo suporte a dark mode).
- **React Compiler** — Compilador oficial da React (habilitado em `next.config.ts`) para otimizações automáticas de render e menos necessidade de `useMemo`/`useCallback`.
- **ESLint + eslint-config-next** — Regras de qualidade e acessibilidade alinhadas ao ecossistema Next.js.
- **Commitizen + cz-conventional-changelog** — Commits no padrão Conventional Commits para histórico e changelog consistentes.
- **Fontes** — Geist (Sans e Mono) via `next/font` para carregamento otimizado e boa legibilidade.

---

## Arquitetura

### Estrutura de pastas

```
gopizza-web/
├── public/           # Arquivos estáticos (imagens, ícones)
├── src/
│   └── app/          # App Router do Next.js
│       ├── layout.tsx   # Layout raiz (metadata, fontes, CSS global)
│       ├── page.tsx     # Página inicial
│       └── globals.css  # Estilos globais e tema Tailwind
├── next.config.ts    # Configuração do Next.js (React Compiler)
├── postcss.config.mjs
├── tsconfig.json     # Path alias: @/* → ./src/*
└── package.json
```

### App Router

- Rotas são definidas pela estrutura de pastas em `src/app/`.
- `layout.tsx` envolve todas as páginas e define metadata (título "Go Pizza", descrição), fontes (Geist) e importação do CSS global.
- Uso do path alias `@/*` apontando para `./src/*` para imports como `@/components/...`.

### Estilos e tema

- **globals.css**: importa Tailwind, define variáveis CSS (`--background`, `--foreground`) e usa `@theme inline` para integrar ao Tailwind v4.
- Suporte a **dark mode** via `prefers-color-scheme: dark` nas variáveis.

### Convenções

- Código em **TypeScript** e **TSX**.
- Componentes e páginas em `src/`, com alias `@/` para imports.
- Lint e tipagem devem passar antes de merge; uso de `npm run commit` para padronizar mensagens de commit.

---

## Deploy

O projeto pode ser implantado em qualquer plataforma que suporte Next.js (ex.: Vercel, Node.js em VPS). Exemplo para Vercel:

- Conecte o repositório à [Vercel](https://vercel.com).
- Build command: `npm run build`
- Output: padrão do Next.js (não é necessário configurar pasta de saída).

Documentação oficial: [Next.js – Deploying](https://nextjs.org/docs/app/building-your-application/deploying).
