

## Reduzir width do UserProfile quando expandido

No `src/components/layout/UserProfile.tsx`, adicionar `max-w-[200px]` (ou similar) ao container principal quando não estiver colapsado, para que o perfil não ocupe toda a largura disponível.

Na div principal do return com profile, alterar de:
```
className={`flex items-center gap-2 ${isCollapsed ? '' : 'p-2'} mx-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
```
Para:
```
className={`flex items-center gap-2 ${isCollapsed ? '' : 'p-2 max-w-[200px]'} mx-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
```

Mesma alteração na div do fallback (quando `!profile`).

