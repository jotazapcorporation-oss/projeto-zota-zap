import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, CreditCard, Calendar, User, LogOut, Tag, FileText, Bell, PiggyBank, Activity, GripVertical, LayoutGrid } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useLocalAuth'
import { Button } from '@/components/ui/button'
import { UserProfile } from './UserProfile'
import { Logo } from '@/components/ui/logo'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

type MenuItem = {
  title: string
  url: string
  icon: any
  id: string
}

const defaultItems: MenuItem[] = [
  { id: 'dashboard', title: 'Dashboard', url: '/dashboard', icon: Home },
  { id: 'transacoes', title: 'Transações', url: '/transacoes', icon: CreditCard },
  { id: 'categorias', title: 'Categorias', url: '/categorias', icon: Tag },
  { id: 'relatorios', title: 'Relatórios', url: '/relatorios', icon: FileText },
  { id: 'termometro', title: 'Termômetro', url: '/termometro', icon: Activity },
  { id: 'lembretes', title: 'Lembretes', url: '/lembretes', icon: Bell },
  { id: 'agenda', title: 'Agenda', url: '/agenda', icon: Calendar },
  { id: 'caixinhas', title: 'Caixinhas', url: '/caixinhas', icon: PiggyBank },
  { id: 'metas', title: 'Metas', url: '/metas', icon: LayoutGrid },
  { id: 'perfil', title: 'Perfil', url: '/perfil', icon: User },
]

function SortableMenuItem({ 
  item, 
  isActive, 
  isCollapsed 
}: { 
  item: MenuItem
  isActive: boolean
  isCollapsed: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton
        asChild
        className={cn(
          "group relative transition-all",
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'hover:bg-accent',
          isDragging && 'opacity-50 scale-105 shadow-lg z-50'
        )}
      >
        <NavLink to={item.url} end className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
          
          {!isCollapsed && (
            <button
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/10 rounded cursor-grab active:cursor-grabbing touch-none"
              onClick={(e) => e.preventDefault()}
              aria-label="Arrastar para reordenar"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { signOut } = useAuth()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const isCollapsed = state === "collapsed"

  // Carregar ordem personalizada do localStorage
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('menu-order')
    if (saved) {
      try {
        const savedIds = JSON.parse(saved) as string[]
        // Reordenar os items baseado na ordem salva
        const ordered = savedIds
          .map(id => defaultItems.find(item => item.id === id))
          .filter(Boolean) as MenuItem[]
        
        // Adicionar novos itens que não estavam salvos
        const newItems = defaultItems.filter(
          item => !savedIds.includes(item.id)
        )
        
        return [...ordered, ...newItems]
      } catch {
        return defaultItems
      }
    }
    return defaultItems
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = menuItems.findIndex((item) => item.id === active.id)
    const newIndex = menuItems.findIndex((item) => item.id === over.id)

    const reordered = arrayMove(menuItems, oldIndex, newIndex)
    setMenuItems(reordered)
    
    // Salvar ordem no localStorage
    localStorage.setItem('menu-order', JSON.stringify(reordered.map(item => item.id)))
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            <Logo iconOnly className="h-8 w-8" />
          ) : (
            <Logo showIcon className="h-8 w-auto" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={menuItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      isActive={isActive(item.url)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </SidebarMenu>
              </SortableContext>
            </DndContext>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        <UserProfile />
        
        <Button
          onClick={signOut}
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
          className="w-full"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden ml-2">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
