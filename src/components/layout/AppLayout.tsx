import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full bg-background">
        <ResizablePanel 
          defaultSize={20} 
          minSize={15} 
          maxSize={30}
          className="min-w-[240px]"
        >
          <AppSidebar />
        </ResizablePanel>
        
        <ResizableHandle withHandle className="w-1 bg-border hover:bg-primary/20 transition-colors" />
        
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full">
            <header className="h-16 flex items-center justify-between px-6 bg-card border-b shadow-sm sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" />
                <h1 className="text-lg font-semibold title-color hidden sm:block">
                  VZAP - Sistema de Gestão Financeira
                </h1>
              </div>
              <ThemeToggle />
            </header>
            <div className="flex-1 p-4 bg-background overflow-auto">
              {children}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarProvider>
  )
}
