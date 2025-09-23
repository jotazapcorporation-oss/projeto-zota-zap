
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useLocalAuth'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LoginFormProps {
  onForgotPassword: () => void
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Attempting login for:', email)
      const { error } = await signIn(email, password)

      if (error) {
        console.error('Login error:', error)
        toast({
          title: "Erro no login",
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message,
          variant: "destructive",
        })
      } else {
        console.log('Login successful')
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        })
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error)
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleSubscribeClick = () => {
    navigate('/plano')
  }

  return (
    <div className="w-full mx-auto">
      <div className="text-start py-4 sm:py-6 lg:py-8">
        <h1 className="text-base sm:text-lg font-bold text-slate-800 mb-2 dark:text-slate-300">
          Bem-vindo de volta
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Entre na sua conta para continuar
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 sm:h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 sm:h-11"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
      
      <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-center">
        <Button
          onClick={handleSubscribeClick}
          variant="outline"
          className="w-full h-10 sm:h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Adquira já
        </Button>
        
        <Button
          variant="link"
          onClick={onForgotPassword}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Esqueceu sua senha?
        </Button>
      </div>
    </div>
  )
}
