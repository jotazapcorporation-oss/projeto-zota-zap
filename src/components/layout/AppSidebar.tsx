import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, CreditCard, Calendar, User, LogOut, Tag, FileText, Bell, PiggyBank, Activity, GripVertical, Flag, BarChart3, PanelLeftClose, PanelLeft, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
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
import { useAdmin } from '@/hooks/useAdmin'
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
  { id: 'relatorios', title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { id: 'termometro', title: 'Termômetro', url: '/termometro', icon: Activity },
  { id: 'lembretes', title: 'Lembretes', url: '/lembretes', icon: Bell },
  { id: 'agenda', title: 'Agenda', url: '/agenda', icon: Calendar },
  { id: 'caixinhas', title: 'Caixinhas', url: '/caixinhas', icon: PiggyBank },
  { id: 'metas', title: 'Metas', url: '/metas', icon: Flag },
  { id: 'perfil', title: 'Perfil', url: '/perfil', icon: User },
]

const adminItem: MenuItem = { id: 'admin', title: 'Administração', url: '/admin', icon: Shield }

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

  const [wasDragging, setWasDragging] = useState(false)

  useEffect(() => {
    if (isDragging) {
      setWasDragging(true)
    } else if (wasDragging) {
      // Reset após um pequeno delay para prevenir click após drag
      const timer = setTimeout(() => setWasDragging(false), 100)
      return () => clearTimeout(timer)
    }
  }, [isDragging, wasDragging])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleClick = (e: React.MouseEvent) => {
    if (wasDragging || isDragging) {
      e.preventDefault()
    }
  }

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton
        asChild
        className={cn(
          "group relative transition-all duration-200",
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'hover:bg-accent hover:translate-x-1',
          isDragging && 'opacity-50 scale-105 shadow-lg z-50'
        )}
      >
        <NavLink 
          to={item.url} 
          end 
          className="flex items-center justify-between"
          onClick={handleClick}
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <item.icon className="h-4 w-4" />
            </motion.div>
            <span className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              {item.title}
            </span>
          </motion.div>
          
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
  const { state, toggleSidebar, isMobile } = useSidebar()
  const location = useLocation()
  const { signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  // No mobile, nunca considerar como colapsado para sempre mostrar textos
  const isCollapsed = !isMobile && state === "collapsed"

  // Carregar ordem personalizada do localStorage
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('menu-order')
    if (saved) {
      try {
        const savedIds = JSON.parse(saved) as string[]
        // Criar lista completa incluindo admin se aplicável
        const allItems = isAdmin ? [...defaultItems, adminItem] : defaultItems
        
        // Reordenar os items baseado na ordem salva
        const ordered = savedIds
          .map(id => allItems.find(item => item.id === id))
          .filter(Boolean) as MenuItem[]
        
        // Adicionar novos itens que não estavam salvos
        const newItems = allItems.filter(
          item => !savedIds.includes(item.id)
        )
        
        return [...ordered, ...newItems]
      } catch {
        return isAdmin ? [...defaultItems, adminItem] : defaultItems
      }
    }
    return isAdmin ? [...defaultItems, adminItem] : defaultItems
  })

  // Atualizar menuItems quando isAdmin mudar
  useEffect(() => {
    setMenuItems(prev => {
      if (isAdmin && !prev.find(item => item.id === 'admin')) {
        // Consultar localStorage para saber onde inserir
        const saved = localStorage.getItem('menu-order')
        if (saved) {
          try {
            const savedIds = JSON.parse(saved) as string[]
            const adminIndex = savedIds.indexOf('admin')
            
            if (adminIndex !== -1) {
              // Inserir na posição correta
              const newItems = [...prev]
              newItems.splice(adminIndex, 0, adminItem)
              return newItems
            }
          } catch (error) {
            console.error('Erro ao carregar ordem do menu:', error)
          }
        }
        // Fallback: adicionar no final
        return [...prev, adminItem]
      } else if (!isAdmin && prev.find(item => item.id === 'admin')) {
        return prev.filter(item => item.id !== 'admin')
      }
      return prev
    })
  }, [isAdmin])

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
    <Sidebar collapsible="icon" className="h-screen border-r transition-all duration-300 ease-in-out">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-end">
          {/* Esconder botão de collapse no mobile - não faz sentido em Sheet */}
          {!isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent"
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </motion.div>
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel 
            className={cn(
              "px-3 text-xs uppercase tracking-wider text-muted-foreground transition-all duration-300",
              isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
            )}
          >
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
          size={isCollapsed ? "icon" : "lg"}
          className="w-full"
        >
          <LogOut className={cn("transition-all duration-300", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
          <span className={cn(
            "ml-2 transition-all duration-300 overflow-hidden whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Sair
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
