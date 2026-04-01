

## Corrigir update sem WHERE na tabela admin_settings

**Problema:** O mutation `updateSettings` faz `.update({...}).select().single()` sem nenhum `.eq()`, resultando em erro do Supabase que bloqueia updates sem filtro.

**Solução:** Usar o `id` do registro já carregado pelo query. Passar o `id` da settings atual no mutation e adicionar `.eq('id', id)`.

**Alteração em `src/hooks/useAdminSettings.ts`:**

Na mutation (linha 32), alterar o tipo do parâmetro para incluir `id`:
```typescript
mutationFn: async (updates: { id: string; use_external_api: boolean; external_api_url: string | null }) => {
```

E na query do update (linha 36-44), adicionar `.eq('id', updates.id)`:
```typescript
const { data, error } = await supabase
  .from('admin_settings')
  .update({
    use_external_api: updates.use_external_api,
    external_api_url: updates.external_api_url,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  })
  .eq('id', updates.id)
  .select()
  .single();
```

**Alteração em `src/pages/Configuracoes.tsx`:**

No `handleSave`, passar o `id` da settings no mutate:
```typescript
updateSettings.mutate({
  id: settings.data.id,
  use_external_api: useExternalApi,
  external_api_url: useExternalApi ? externalApiUrl.trim() : null,
});
```

Duas alterações mínimas em dois arquivos.

