
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';

type AuthMode = 'login' | 'forgot';

const authImages = {
  login: '/lovable-uploads/e73af031-b391-404d-a839-c9cbe548576b.png',
  forgot: '/lovable-uploads/e73af031-b391-404d-a839-c9cbe548576b.png'
};

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen flex bg-background p-4 sm:p-6">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl">
        <img 
          src="/logo-jzap-sidebar.jpeg" 
          alt="JZAP Logo" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-primary/20" />
        <div className="absolute bottom-8 left-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            
          </div>
          
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Header with Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md lg:max-w-lg mt-4 sm:mt-8 space-y-4">
          <div className="mb-1">
            <Logo showIcon className="h-6 sm:h-8 w-auto" />
          </div>
          
          {mode === 'login' && <LoginForm onForgotPassword={() => setMode('forgot')} />}
          {mode === 'forgot' && <ForgotPasswordForm onBack={() => setMode('login')} />}
        </div>
      </div>
    </div>
  );
}
