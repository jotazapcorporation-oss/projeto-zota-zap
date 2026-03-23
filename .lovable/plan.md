

## Remover animação do container principal em /metas

No `src/pages/Metas.tsx`, remover a classe `animate-fade-in` da div principal (tela de boards, ~linha 228):

```
<div className="min-h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
```

Alterar para:

```
<div className="min-h-[calc(100vh-8rem)] flex flex-col">
```

Uma única alteração de uma linha. As demais animações (header, cards, progress bar) permanecem intactas.

