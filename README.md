# Go Pizza — Web

Aplicação web do **Go Pizza**, projeto de delivery de pizzas. Desenvolvida com Next.js (App Router), React 19 e TypeScript.

---

## Descrição do projeto

O **Go Pizza Web** é a interface front-end do sistema Go Pizza, voltada para o usuário final que deseja realizar pedidos de pizza.

**Estado atual**

- Tela de **login** (`/`) com layout em duas metades: formulário e imagem de destaque em `public/`.
- Integração com o backend via **Axios** no endpoint `api/auth/login` (POST com `email` e `password`).
- **Notificações globais** com `react-toastify` em qualquer Client Component.

O projeto está preparado para evoluir com cardápio, carrinho e checkout.

---

## Como rodar o projeto

### Pré-requisitos

- **Node.js** 18.x ou superior
- **npm**, **yarn**, **pnpm** ou **bun**
- Backend da API acessível na URL configurada em `src/lib/axios.ts` (por padrão `https://localhost:8080/`), com certificado válido em desenvolvimento se usar HTTPS

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

- Instância Axios em **`src/lib/axios.ts`**: `baseURL` e headers padrão (`Content-Type: application/json`).
- **Login**: `POST` relativo à base → `api/auth/login`  
  Corpo esperado (conforme uso no front): `{ "email": string, "password": string }`.

Ajuste `baseURL` conforme o ambiente (local, homologação, produção). Para múltiplos ambientes, o próximo passo natural é usar variáveis de ambiente (ex.: `NEXT_PUBLIC_API_URL`) e montar o `axios.create` a partir delas.

---

## Decisões técnicas

- **Next.js 16** — App Router, SSR e otimizações; base para SEO e rotas futuras.
- **React 19** — Versão atual do ecossistema React.
- **TypeScript** — Tipagem estática e manutenção mais segura.
- **Tailwind CSS v4** — Estilos utilitários com PostCSS; tema via variáveis em `globals.css` e suporte a dark mode por `prefers-color-scheme`.
- **React Compiler** — Habilitado em `next.config.ts` para otimizações automáticas de render.
- **React Hook Form** — Formulários com menos re-renders; validação declarativa no login.
- **@hookform/resolvers** — Pronto para validação com Zod/Yup quando necessário.
- **Axios** — Cliente HTTP centralizado (`src/lib/axios.ts`) para chamadas à API.
- **react-toastify** — Toasts globais; container configurado em `Providers` e estilos importados em `globals.css`.
- **ESLint + eslint-config-next** — Qualidade e boas práticas alinhadas ao Next.js.
- **Commitizen + cz-conventional-changelog** — Commits padronizados.
- **Fontes** — Geist (Sans e Mono) via `next/font`.

---

## Arquitetura

### Estrutura de pastas

```
gopizza-web/
├── public/                 # Estáticos (ex.: imagem da tela de login)
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout raiz + <Providers>
│   │   ├── page.tsx        # Página inicial (login — Client Component)
│   │   └── globals.css     # Tailwind, React Toastify e tema
│   ├── components/
│   │   └── providers.tsx   # ToastContainer global (Client)
│   └── lib/
│       ├── axios.ts        # Instância Axios (baseURL da API)
│       └── toast.ts        # Re-export de toast (uso app-wide)
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json           # Alias @/* → ./src/*
└── package.json
```

### App Router e layout

- Rotas em `src/app/`.
- **`layout.tsx`** (Server Component): metadata, fontes Geist, import de `globals.css` e envolvimento de `{children}` com **`Providers`** para disponibilizar toasts em toda a aplicação.
- **`page.tsx`**: login com `"use client"` por causa de hooks (`useForm`) e chamadas à API no browser.

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
