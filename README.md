# Mimoz - Plataforma de Gift Cards

Plataforma whitelabel para empresas venderem gift cards. Sistema completo com dashboards para administração, proprietários de negócios e operadores de caixa.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **Auth:** Supabase Auth (Google OAuth)
- **RBAC:** BoxyHQ-compatible role system
- **Database:** Supabase PostgreSQL

## Features

- **Multi-tenant:** Cada empresa tem seus próprios dados isolados
- **RBAC:** Sistema de permissões baseado em funções
- **Google OAuth:** Login seguro via Google
- **RLS:** Row Level Security no banco de dados
- **Server-side:** Toda autenticação e autorização no servidor

## Roles

| Role | Acesso |
|------|--------|
| ADMIN | Acesso total ao sistema |
| BUSINESS_OWNER | Acesso à sua empresa |
| CASHIER | Validação de códigos apenas |

## Getting Started

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Ative Google OAuth em Authentication > Providers
3. Execute as migrations no SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql` (opcional)

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha as variáveis:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
├── /app
│   ├── /admin          # Dashboard do administrador
│   ├── /business       # Dashboard do proprietário
│   ├── /cashier        # Dashboard do operador
│   ├── /auth           # Páginas de autenticação
│   └── /api            # API routes
├── /components
│   ├── /dashboard      # Componentes do dashboard
│   └── /ui             # Componentes de UI
├── /lib
│   ├── /supabase       # Clientes Supabase
│   ├── auth.ts         # Utilitários de autenticação
│   └── rbac.ts         # Sistema de permissões
└── /types              # Definições TypeScript

/supabase
└── /migrations         # SQL migrations
```

## API Routes

| Endpoint | Method | Roles | Descrição |
|----------|--------|-------|-----------|
| `/api/admin/businesses` | GET, POST | ADMIN | Gerenciar empresas |
| `/api/admin/users` | GET, PATCH | ADMIN | Gerenciar usuários |
| `/api/business/info` | GET | ADMIN, OWNER | Info da empresa |
| `/api/codes/validate` | POST, GET | ALL | Validar códigos |

## Database Schema

### businesses
- `id` - UUID (PK)
- `name` - Nome da empresa
- `slug` - URL slug único

### profiles
- `id` - UUID (PK, FK auth.users)
- `email` - Email do usuário
- `business_id` - FK businesses
- `role` - ADMIN, BUSINESS_OWNER, CASHIER

### code_validations
- `id` - UUID (PK)
- `business_id` - FK businesses
- `cashier_id` - FK profiles
- `code` - Código validado
- `validated_at` - Timestamp

## Security

- ✅ Server-side authentication
- ✅ Row Level Security (RLS)
- ✅ Role-based access control
- ✅ Business isolation
- ✅ Middleware protection

## Future Features

- [ ] Páginas públicas `/store/[slug]`
- [ ] Integração de pagamentos
- [ ] BoxyHQ SSO/SAML
- [ ] Analytics avançados
- [ ] Geração de gift cards

## License

Proprietary - All rights reserved
