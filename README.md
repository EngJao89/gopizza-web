# Go Pizza — Web

Aplicação web do **Go Pizza**, projeto de delivery de pizzas. Desenvolvida com Next.js (App Router), React 19 e TypeScript.

---

## Descrição do projeto

O **Go Pizza Web** é a interface front-end do sistema Go Pizza, voltada para o usuário final que deseja realizar pedidos de pizza.

**Estado atual**

- Tela de **login** (`/`) e **cadastro** (`/signup`) com o mesmo layout em duas metades (formulário + imagem em `public/`).
- **Login**: `POST api/auth/login` com `email` e `password`. Em sucesso, persiste **JWT** em `localStorage` (se a resposta trouxer `accessToken` / `token` / etc.) ou marca sessão em `sessionStorage`; redireciona para **`/dashboard`**. O Axios envia **`Authorization: Bearer`** quando há token.
- **Logout**: `POST api/auth/logout` (com Bearer se existir token), limpa armazenamento local e redireciona para **`/`**. Botão no header do dashboard.
- **Rotas `/dashboard/*`**: protegidas por **`DashboardAuthGuard`** — sem sessão/token, redireciona ao login.
- **Cadastro**: `POST api/auth/signup` com `email`, `name`, `phone`, `password`, `birthday` (ISO `YYYY-MM-DD`) e `cpf` (apenas dígitos no payload). Ajuste o path em `src/app/signup/page.tsx` se a API usar outro endpoint.
- **Notificações globais** com `react-toastify` em qualquer Client Component.
- **Dashboard garçom** (`/dashboard`): header vermelho (“Olá, Garçom”), busca com botão verde, lista **Cardápio** com fotos (Unsplash), navegação inferior **Cardápio** / **Pedidos** (`/dashboard/pedidos` — placeholder). Tipografia serif (**Playfair Display**) nas rotas sob `dashboard/`.

O projeto está preparado para evoluir com cardápio dinâmico (API), carrinho e checkout.

---

## Como rodar o projeto

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm**, **yarn**, **pnpm** ou **bun**
- Backend da API acessível na URL em `src/lib/axios.ts`: padrão **`http://localhost:8080/`** (HTTP em local evita `ERR_SSL_PROTOCOL_ERROR` se o servidor não usar HTTPS). Sobrescreva com `NEXT_PUBLIC_API_URL` (veja `.env.example`).

### Instalação

```bash
git clone <url-do-repositorio>
cd gopizza-web

npm install
```

### Comandos disponíveis

| Comando          | Descrição                                                      |
|------------------|----------------------------------------------------------------|
| `npm run dev`    | Servidor de desenvolvimento em `http://localhost:3000`         |
| `npm run build`  | Build de produção                                                |
| `npm run start`  | Servidor com o build de produção                               |
| `npm run lint`   | ESLint                                                         |
| `npm run commit` | Commitizen (Conventional Commits)                              |

### Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O front recarrega ao salvar alterações.

### Build e produção

```bash
npm run build
npm run start
```

---

## API e configuração do cliente HTTP

- Instância Axios em **`src/lib/axios.ts`**: `baseURL` (padrão `http://localhost:8080/` ou `NEXT_PUBLIC_API_URL`) e headers (`Content-Type: application/json`).
- **Login**: `POST` → `api/auth/login`  
  Corpo: `{ "email": string, "password": string }`.
- **Cadastro**: `POST` → `api/auth/signup`  
  Corpo: `{ "email", "name", "phone", "password", "birthday", "cpf" }` (telefone e CPF enviados só com dígitos).
- **Logout**: `POST` → `api/auth/logout` (opcional no backend; o front sempre limpa a sessão local).
- **Cardápio (dashboard)**: `GET` → `api/pizza-flavors` — lista normalizada em `src/lib/pizza-flavors.ts` (aceita array direto ou envelope `data` / `items` / `content` / etc.; campos: `id`, `name`, `description`, imagem em `image` / `imageUrl` / `photo` / `picture`, URLs relativas resolvidas com a base da API).

Use **`NEXT_PUBLIC_API_URL`** no `.env.local` para apontar para outro host/porta (copie de `.env.example`). Em local, use **`http://`** se a API não tiver TLS; **`https://`** só quando o backend realmente servir HTTPS (com certificado válido).

---

## Decisões técnicas

- **Next.js 16** — App Router, SSR e otimizações; base para SEO e rotas futuras.
- **React 19** — Versão atual do ecossistema React.
- **TypeScript** — Tipagem estática e manutenção mais segura.
- **Tailwind CSS v4** — Estilos utilitários com PostCSS; tema via variáveis em `globals.css` e suporte a dark mode por `prefers-color-scheme`.
- **React Compiler** — Habilitado em `next.config.ts` para otimizações automáticas de render.
- **React Hook Form** — Formulários com menos re-renders; validação declarativa em login e cadastro.
- **@hookform/resolvers** — Pronto para validação com Zod/Yup quando necessário.
- **Axios** — Cliente HTTP centralizado (`src/lib/axios.ts`) com interceptor de **Bearer**; **`src/lib/auth.ts`** (token/sessão) e **`src/lib/logout.ts`** (saída).
- **react-toastify** — Toasts globais; container configurado em `Providers` e estilos importados em `globals.css`.
- **lucide-react** — Ícones SVG (dashboard: sair, busca, chevron, loading; guard de autenticação).
- **ESLint + eslint-config-next** — Qualidade e boas práticas alinhadas ao Next.js.
- **Commitizen + cz-conventional-changelog** — Commits padronizados.
- **Fontes** — Geist (Sans e Mono) via `next/font`.

---

## Arquitetura

### Estrutura de pastas

```
gopizza-web/
├── public/                 # Estáticos (ex.: imagem das telas de auth)
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout raiz + <Providers>
│   │   ├── page.tsx        # Login (/) — Client Component
│   │   ├── signup/
│   │   │   ├── layout.tsx  # Metadata da rota de cadastro
│   │   │   └── page.tsx    # Cadastro (/signup)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx  # Fundo + Playfair (garçom)
│   │   │   ├── page.tsx    # Cardápio (/dashboard)
│   │   │   └── pedidos/page.tsx  # Placeholder (/dashboard/pedidos)
│   │   └── globals.css     # Tailwind, React Toastify e tema
│   ├── components/
│   │   ├── auth/
│   │   │   └── auth-split-layout.tsx  # Layout 50/50 compartilhado (login/signup)
│   │   ├── dashboard/
│   │   │   ├── dashboard-bottom-nav.tsx  # Tabs Cardápio / Pedidos
│   │   │   └── dashboard-auth-guard.tsx  # Redireciona se não autenticado
│   │   └── providers.tsx   # ToastContainer global (Client)
│   └── lib/
│       ├── axios.ts        # Instância Axios + Bearer
│       ├── auth.ts         # Token / sessão e parse do login
│       ├── logout.ts       # POST logout + clearAuth
│       ├── pizza-flavors.ts # Normaliza GET api/pizza-flavors → UI
│       ├── toast.ts        # Re-export de toast (uso app-wide)
│       └── validators/
│           └── cpf.ts      # Validação de CPF no cadastro
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json           # Alias @/* → ./src/*
└── package.json
```

### App Router e layout

- Rotas em `src/app/`.
- **`layout.tsx`** (Server Component): metadata, fontes Geist, import de `globals.css` e envolvimento de `{children}` com **`Providers`** para disponibilizar toasts em toda a aplicação.
- **`page.tsx`** (home) e **`signup/page.tsx`**: `"use client"` por hooks (`useForm`) e chamadas à API no browser. Navegação entre telas: link **Criar conta** (`/`) → `/signup`; **Ja tenho conta** → `/`.
- **`dashboard/page.tsx`**: `"use client"` (busca no cardápio). Imagens de pizza via `next/image` e domínio `images.unsplash.com` em `next.config.ts` (`remotePatterns`).

### Toasts (aplicação inteira)

1. **`Providers`** (`src/components/providers.tsx`) renderiza um único `<ToastContainer />` com opções globais (posição, autoClose, tema, limite, z-index).
2. **`globals.css`** importa `react-toastify/dist/ReactToastify.css`.
3. Em qualquer **Client Component**, importe e use:

```tsx
import { toast } from "@/lib/toast";

toast.success("Mensagem de sucesso");
toast.error("Mensagem de erro");
```

### Estilos

- **globals.css**: `@import "tailwindcss"`, estilos do Toastify, variáveis `--background` / `--foreground` e `@theme inline` para o Tailwind v4.

### Convenções

- Código em **TypeScript** / **TSX**.
- Alias **`@/`** → `src/`.
- Componentes reutilizáveis em `src/components/`; utilitários e clientes em `src/lib/`.
- Preferir `npm run lint` antes de abrir PR; `npm run commit` para mensagens de commit padronizadas.

---

## Deploy

Compatível com qualquer hospedagem que rode Next.js (ex.: Vercel, Node em VPS).

- Build: `npm run build`
- Em produção, configure a **`baseURL`** do Axios (ou variáveis de ambiente) para apontar para a API real.

Documentação: [Next.js – Deploying](https://nextjs.org/docs/app/building-your-application/deploying).
