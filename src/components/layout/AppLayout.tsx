import { SidebarProvider } from "@/components/ui/sidebar";
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
          <header className="h-16 flex items-center justify-between px-6 bg-card border-b shadow-sm sticky top-0 z-40">
            <h1 className="text-lg font-semibold title-color hidden sm:block">VZAP - Sistema de Gestão Financeira</h1>
            <ThemeToggle />
          </header>
          <div className="flex-1 p-4 bg-background overflow-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
