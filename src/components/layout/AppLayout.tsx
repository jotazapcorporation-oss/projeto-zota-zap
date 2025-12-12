import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex flex-col flex-1">
          <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-card border-b shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 sm:gap-3">
              <SidebarTrigger className="h-10 w-10 sm:h-10 sm:w-10 flex-shrink-0 touch-manipulation" />
              <h1 className="text-sm sm:text-lg font-semibold title-color hidden sm:block">VZAP - Sistema de Gestão Financeira</h1>
            </div>
            <ThemeToggle />
          </header>
          <div className="flex-1 p-4 bg-background">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
