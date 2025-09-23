
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useLocalAuth'
import { NavLink } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

interface UserProfile {
  nome: string
  phone: string
  avatar_url?: string
  email?: string
}

interface SubscriptionStatus {
  status: string
  plan_name?: string
}

export function UserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // Database tables don't exist yet, use fallback profile
      setProfile({
        nome: user?.email?.split('@')[0] || 'Usuário',
        phone: '',
        email: user?.email
      })
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
          <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <NavLink to="/perfil" className="block">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">Configurar perfil</p>
          </div>
        </div>
      </NavLink>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isActiveSubscription = subscriptionStatus?.status === 'active'

  return (
    <NavLink to="/perfil" className="block">
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile.nome)}
            </AvatarFallback>
          </Avatar>
          {isActiveSubscription && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{profile.nome}</p>
            {isActiveSubscription && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Ativo
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {subscriptionStatus?.plan_name || profile.phone || profile.email || 'Completar perfil'}
          </p>
        </div>
      </div>
    </NavLink>
  )
}
