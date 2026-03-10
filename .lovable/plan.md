

## Correção do SidebarGroupLabel

**Problema:** Quando a sidebar colapsa, o label "Menu" recebe `h-0 overflow-hidden`, removendo seu espaço vertical e fazendo os itens subirem.

**Solução:** Na linha do `SidebarGroupLabel` em `src/components/layout/AppSidebar.tsx`, remover `h-0 overflow-hidden` e manter apenas `opacity-0` quando colapsado.

**De:**
```
isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
```

**Para:**
```
isCollapsed ? "opacity-0" : "opacity-100"
```

Uma única alteração de uma linha.

