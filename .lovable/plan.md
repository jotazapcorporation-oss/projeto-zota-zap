

## Plan: Hide /lembretes from sidebar menu

Remove the `lembretes` entry from the `defaultItems` array in `src/components/layout/AppSidebar.tsx` (line 51). The route will remain accessible via direct URL, only the menu link will be hidden.

### Changes

**`src/components/layout/AppSidebar.tsx`** — Remove line 51 (`{ id: 'lembretes', title: 'Lembretes', url: '/lembretes', icon: Bell }`).

Also clean up the unused `Bell` import from lucide-react if no longer referenced.

