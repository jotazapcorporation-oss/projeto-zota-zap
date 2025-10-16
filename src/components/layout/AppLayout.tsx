
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="h-16 flex items-center justify-between px-6 bg-card border-b shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" />
              <h1 className="text-lg font-semibold title-color hidden sm:block">
                VZAP - Sistema de Gestão Financeira
              </h1>
            </div>
            <ThemeToggle />
          </header>
          <div className="flex-1 p-4 bg-background">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
