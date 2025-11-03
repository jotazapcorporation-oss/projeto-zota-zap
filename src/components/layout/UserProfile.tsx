
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useLocalAuth'
import { NavLink } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { supabase } from '@/integrations/supabase/client'
import { getAvatarUrl } from '@/utils/avatar'

interface UserProfile {
  nome: string
  phone: string
  avatar_url?: string
  email?: string
  arquivo?: string
}

interface SubscriptionStatus {
  status: string
  plan_name?: string
}

export function UserProfile() {
  const { user } = useAuth()
  const { state } = useSidebar()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(false)
  
  const isCollapsed = state === "collapsed"

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setLoading(true)
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('nome, phone, avatar_url, email, assinaturaid, arquivo')
            .eq('id', user.id)
            .single()

          if (error) throw error

          const arquivo = data?.arquivo;
          const avatar_url = getAvatarUrl(arquivo) || data?.avatar_url;

          setProfile({
            nome: data?.nome || user?.email?.split('@')[0] || 'Usuário',
            phone: data?.phone || '',
            avatar_url,
            email: user?.email,
            arquivo
          })

          // Set subscription status based on assinaturaid
          if (data?.assinaturaid) {
            setSubscriptionStatus({ status: 'active' })
          }
        } catch (error) {
          console.error('Error loading profile:', error)
          // Fallback to email-based profile
          setProfile({
            nome: user?.email?.split('@')[0] || 'Usuário',
            phone: '',
            email: user?.email
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadProfile()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 mx-2 bg-muted/50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-9 w-9 bg-muted rounded-full"></div>
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
        <div className={`flex items-center gap-2 p-2 mx-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">Configurar perfil</p>
            </div>
          )}
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
      <div className={`flex items-center gap-2 ${isCollapsed ? '' : 'p-2'} mx-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile.nome)}
            </AvatarFallback>
          </Avatar>
          {isActiveSubscription && !isCollapsed && (
            <div className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{profile.nome}</p>
              {isActiveSubscription && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'Completar perfil'}
            </p>
          </div>
        )}
      </div>
    </NavLink>
  )
}
