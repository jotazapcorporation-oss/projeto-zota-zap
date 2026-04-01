

## Tela "Configurações Gerais" (Admin-only)

### Resumo
Criar uma página admin-only `/configuracoes` com um toggle que define se o sistema usa os webhooks n8n atuais ou uma API externa customizável. Quando ativado, exibe um campo para URL base. As rotas de criação de usuário (admin) e dependentes passam a usar `{base_url}/admin` e `{base_url}/dependente` com Bearer token do Supabase.

### 1. Banco de dados
Criar tabela `admin_settings` (single-row config):

```sql
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_external_api boolean NOT NULL DEFAULT false,
  external_api_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler (necessário para dependentes e admin)
CREATE POLICY "Authenticated can read settings"
  ON public.admin_settings FOR SELECT TO authenticated
  USING (true);

-- Apenas admins podem atualizar
CREATE POLICY "Admins can update settings"
  ON public.admin_settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Inserir row inicial
INSERT INTO public.admin_settings (use_external_api, external_api_url)
VALUES (false, null);
```

### 2. Hook `useAdminSettings`
Novo hook (`src/hooks/useAdminSettings.ts`) que:
- Lê a config da tabela `admin_settings` (useQuery)
- Mutation para atualizar `use_external_api` e `external_api_url`
- Exporta uma função helper `getApiConfig()` que retorna `{ useExternal, baseUrl }`

### 3. Página `src/pages/Configuracoes.tsx`
- Card com título "Integração de API"
- Switch/toggle: "Usar API externa" (default off)
- Quando ligado, exibe campo de texto para a URL base da API
- Botão "Salvar"
- Layout simples, seguindo o padrão visual das outras páginas admin

### 4. Rota e navegação
- **App.tsx**: Adicionar rota `/configuracoes` com `AdminRoute` (mesmo padrão de `/admin`)
- **AppSidebar.tsx**: Adicionar item "Configurações" com ícone `Settings` (lucide), visível apenas para admins (mesmo padrão do `adminItem`)

### 5. Adaptar criação de usuários (`useAdminActions.ts`)
No `createUser` mutation:
- Buscar config de `admin_settings`
- Se `use_external_api = false`: comportamento atual (POST para webhook n8n com Basic Auth)
- Se `use_external_api = true`: POST para `{external_api_url}/admin` com `Authorization: Bearer {access_token}` do Supabase, mesmo payload JSON

### 6. Adaptar criação de dependentes (`DependentesTab.tsx`)
Nos handlers `handleAddDependente` e `handleDeleteDependente`:
- Buscar config de `admin_settings`
- Se `use_external_api = false`: comportamento atual (webhooks n8n com Basic Auth hardcoded)
- Se `use_external_api = true`:
  - Adicionar: POST `{external_api_url}/dependente` com Bearer token, mesmo payload
  - Excluir: POST `{external_api_url}/dependente/excluir` com Bearer token, mesmo payload

### Detalhes técnicos
- O Bearer token será obtido via `supabase.auth.getSession()` → `session.access_token`
- A leitura da config será feita com uma query simples: `supabase.from('admin_settings').select('*').single()`
- O campo `external_api_url` será validado como URL antes de salvar

