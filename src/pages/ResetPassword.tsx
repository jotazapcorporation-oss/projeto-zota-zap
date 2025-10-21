import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useLocalAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
});

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      setVerifyingToken(true);
      
      // Extract token and type from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (!token || type !== 'recovery') {
        setHasToken(false);
        setTokenError('Link inválido ou expirado');
        setVerifyingToken(false);
        toast({
          title: "Link inválido",
          description: "O link de recuperação de senha está inválido ou expirou.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Verify the OTP token and establish session
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        });

        if (error) {
          console.error('Token verification error:', error);
          setHasToken(false);
          
          // Determine error message based on error type
          let errorMessage = 'O link de recuperação está inválido ou expirou.';
          if (error.message?.includes('expired')) {
            errorMessage = 'O link expirou. Solicite um novo link de recuperação.';
          } else if (error.message?.includes('invalid')) {
            errorMessage = 'Link inválido ou já utilizado.';
          }
          
          setTokenError(errorMessage);
          toast({
            title: "Erro de verificação",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          // Session established successfully
          setHasToken(true);
          setTokenError(null);
          
          // Clean up URL by removing hash params
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (error) {
        console.error('Unexpected error during token verification:', error);
        setHasToken(false);
        setTokenError('Erro ao verificar o link. Tente novamente.');
        toast({
          title: "Erro",
          description: "Erro ao verificar o link. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate passwords
      passwordSchema.parse({ password, confirmPassword });
      
      setLoading(true);

      const { error } = await updatePassword(password);

      if (error) {
        console.error('Password update error:', error);
        
        if (error.message?.includes('session')) {
          toast({
            title: "Link expirado",
            description: "O link de recuperação expirou. Solicite um novo link de recuperação.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao atualizar senha",
            description: "Não foi possível atualizar sua senha. Tente novamente.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso. Redirecionando para o login...",
      });

      // Clear form
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Erro de validação",
          description: firstError.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/auth');
    toast({
      title: "Solicite um novo link",
      description: "Use a opção 'Esqueceu sua senha?' na tela de login.",
    });
  };

  // Show loading state while verifying token
  if (verifyingToken) {
    return (
      <div className="min-h-screen flex bg-background p-4 sm:p-6">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl">
          <img 
            src="/logo-vzap-hq.jpg" 
            alt="VZAP Logo" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-primary/20" />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md lg:max-w-lg mt-4 sm:mt-8">
            <div className="mb-6">
              <Logo showIcon className="h-6 sm:h-8 w-auto" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Verificando Link</CardTitle>
                <CardDescription>
                  Aguarde enquanto verificamos seu link de recuperação...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if token is invalid
  if (!hasToken) {
    return (
      <div className="min-h-screen flex bg-background p-4 sm:p-6">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl">
          <img 
            src="/logo-vzap-hq.jpg" 
            alt="VZAP Logo" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-primary/20" />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md lg:max-w-lg mt-4 sm:mt-8">
            <div className="mb-6">
              <Logo showIcon className="h-6 sm:h-8 w-auto" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Link Inválido</CardTitle>
                <CardDescription>
                  {tokenError || 'O link de recuperação de senha está inválido ou expirou.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Por favor, solicite um novo link de recuperação de senha através da tela de login.
                </p>
                <Button onClick={handleRequestNewLink} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background p-4 sm:p-6">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl">
        <img 
          src="/logo-vzap-hq.jpg" 
          alt="VZAP Logo" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-primary/20" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md lg:max-w-lg mt-4 sm:mt-8">
          <div className="mb-6">
            <Logo showIcon className="h-6 sm:h-8 w-auto" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Redefinir Senha</CardTitle>
              <CardDescription>
                Digite sua nova senha abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Atualizar Senha
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/auth')}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
