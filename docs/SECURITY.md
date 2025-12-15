# Tapresente - Segurança e Arquitetura

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16 | Framework React com App Router |
| TypeScript | 5 | Tipagem estática |
| TailwindCSS | 4 | Estilização |
| Supabase | 2.86 | Banco de dados PostgreSQL + Auth |
| Zod | 3.23 | Validação de dados |
| Lucide React | 0.555 | Ícones |

### Bibliotecas de Autenticação
- `@supabase/ssr` - Cliente Supabase para SSR
- `@supabase/supabase-js` - SDK principal
- `@boxyhq/saml-jackson` - Preparado para SSO futuro

---

## Modelo de Segurança

### Camadas de Proteção

```
┌─────────────────────────────────────────┐
│           1. MIDDLEWARE                 │
│    Valida sessão em todas as rotas      │
├─────────────────────────────────────────┤
│           2. SERVER COMPONENTS          │
│    Verifica role antes de renderizar    │
├─────────────────────────────────────────┤
│           3. API ROUTES                 │
│    Valida sessão + permissões + dados   │
├─────────────────────────────────────────┤
│           4. ROW LEVEL SECURITY         │
│    Banco rejeita queries não autorizadas│
└─────────────────────────────────────────┘
```

### Princípios Aplicados

| Princípio | Implementação |
|-----------|---------------|
| **Zero Trust** | Toda requisição é validada no servidor |
| **Least Privilege** | Cada role tem apenas permissões necessárias |
| **Defense in Depth** | 4 camadas de proteção |
| **Data Isolation** | Empresas não acessam dados de outras |

---

## Sistema de Roles

### ADMIN
Acesso total ao sistema.

| Recurso | Criar | Ler | Atualizar | Deletar |
|---------|:-----:|:---:|:---------:|:-------:|
| Empresas | ✅ | ✅ | ✅ | ✅ |
| Usuários | ✅ | ✅ | ✅ | ✅ |
| Validações | ✅ | ✅ | ✅ | ✅ |
| Configurações | ✅ | ✅ | ✅ | ✅ |

**Permissões:**
- `businesses:read`, `businesses:write`, `businesses:delete`
- `users:read`, `users:write`, `users:delete`
- `codes:validate`, `codes:read`
- `analytics:read`
- `settings:read`, `settings:write`

---

### BUSINESS_OWNER
Acesso restrito à sua empresa.

| Recurso | Criar | Ler | Atualizar | Deletar |
|---------|:-----:|:---:|:---------:|:-------:|
| Sua Empresa | ❌ | ✅ | ✅ | ❌ |
| Usuários da Empresa | ❌ | ✅ | ✅ | ❌ |
| Validações da Empresa | ✅ | ✅ | ❌ | ❌ |
| Configurações | ❌ | ✅ | ✅ | ❌ |

**Permissões:**
- `businesses:read`, `businesses:write`
- `users:read`, `users:write`
- `codes:validate`, `codes:read`
- `analytics:read`
- `settings:read`, `settings:write`

**Restrição:** Só acessa dados onde `business_id = seu_business_id`

---

### CASHIER
Acesso mínimo para operação.

| Recurso | Criar | Ler | Atualizar | Deletar |
|---------|:-----:|:---:|:---------:|:-------:|
| Empresas | ❌ | ❌ | ❌ | ❌ |
| Usuários | ❌ | ❌ | ❌ | ❌ |
| Suas Validações | ✅ | ✅ | ❌ | ❌ |
| Configurações | ❌ | ❌ | ❌ | ❌ |

**Permissões:**
- `codes:validate`, `codes:read`

**Restrição:** Só vê validações que ele mesmo fez.

---

## Row Level Security (RLS)

Políticas aplicadas diretamente no PostgreSQL:

```sql
-- ADMIN: acesso total
CREATE POLICY "Admins can do everything"
  ON businesses FOR ALL
  USING (is_admin(auth.uid()));

-- BUSINESS_OWNER: só sua empresa
CREATE POLICY "Owners read own business"
  ON businesses FOR SELECT
  USING (id = get_user_business_id(auth.uid()));

-- CASHIER: só suas validações
CREATE POLICY "Cashiers read own validations"
  ON code_validations FOR SELECT
  USING (cashier_id = auth.uid());
```

**Benefício:** Mesmo que o código da aplicação tenha bugs, o banco de dados **nunca** retorna dados não autorizados.

---

## Fluxo de Autenticação

```
Usuário → Google OAuth → Supabase Auth → Callback → Profile Check → Dashboard
```

1. Usuário clica "Continuar com Google"
2. Supabase redireciona para Google
3. Google autentica e retorna token
4. Supabase cria sessão e trigger cria profile
5. Middleware verifica role e redireciona

---

## Proteções Implementadas

| Vetor de Ataque | Proteção |
|-----------------|----------|
| Acesso não autenticado | Middleware bloqueia |
| Escalação de privilégio | RBAC + RLS |
| Acesso cross-tenant | RLS com business_id |
| Manipulação de dados | Validação Zod no servidor |
| Session hijacking | Cookies HttpOnly + Secure |
| CSRF | Supabase PKCE flow |

---

## Checklist de Segurança

- [x] Autenticação 100% server-side
- [x] Nenhuma verificação de role no cliente
- [x] RLS em todas as tabelas
- [x] Validação de input com Zod
- [x] Isolamento de dados por empresa
- [x] Cookies seguros (HttpOnly, Secure, SameSite)
- [x] Sem secrets expostos no cliente
- [x] Middleware protege todas as rotas

---

## Tratamento de Erros

### Camadas de Fallback

| Cenário | Comportamento |
|---------|---------------|
| Supabase não configurado | Redireciona para `/setup` |
| Erro de sessão | Redireciona para `/auth/error` |
| Erro em componente | Error boundary com botão "Tentar Novamente" |
| Tabela vazia | Componente `EmptyState` com mensagem amigável |
| Timeout de query | Fallback para dados vazios + log de erro |
| 404 | Página customizada com navegação |

### Componentes de Estado

```
src/app/error.tsx        → Error boundary global
src/app/not-found.tsx    → Página 404
src/app/loading.tsx      → Loading state global
src/app/setup/page.tsx   → Configuração inicial

src/components/ui/
├── empty-state.tsx      → Tabelas/listas vazias
└── error-state.tsx      → Erros inline com retry
```

### Safe Fetch Utility

```typescript
// Exemplo de uso
const result = await safeQuery(
  (supabase) => supabase.from('businesses').select('*'),
  { fallback: [], timeout: 10000 }
);

if (result.success) {
  // result.data contém os dados ou fallback
} else {
  // result.error contém a mensagem de erro
}
```

### Erros Tratados

| Código | Mensagem |
|--------|----------|
| `no_profile` | Perfil não encontrado |
| `auth_failed` | Falha na autenticação |
| `session_error` | Erro de sessão |
| `database_error` | Erro no banco de dados |
| `timeout` | Timeout na requisição |
| `access_denied` | Acesso negado |

---

## Arquivos de Segurança

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/middleware.ts` | Proteção de rotas |
| `src/lib/auth.ts` | Funções de autenticação |
| `src/lib/rbac.ts` | Sistema de permissões |
| `src/lib/safe-fetch.ts` | Queries com fallback |
| `supabase/migrations/002_rls_policies.sql` | Políticas RLS |
