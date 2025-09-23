
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useLocalAuth'
import { toast } from '@/hooks/use-toast'
import { CreditCard, RefreshCw, AlertCircle } from 'lucide-react'
import { fetchSubscriptionInfo, mapSubscriptionData } from '@/utils/subscription'
import { SubscriptionDetails } from './SubscriptionDetails'
import type { SubscriptionData } from '@/types/subscription'

export function SubscriptionInfo() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)

  useEffect(() => {
    loadSubscriptionData()
  }, [user])

  const loadSubscriptionData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const apiData = await fetchSubscriptionInfo(user.id)
      if (apiData) {
        const mappedData = mapSubscriptionData(apiData)
        setSubscriptionData(mappedData)
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados da assinatura:', error)
      toast({
        title: "Erro ao carregar assinatura",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const syncSubscriptionData = async () => {
    try {
      setSyncing(true)
      await loadSubscriptionData()
      toast({
        title: "Dados atualizados",
        description: "Informações da assinatura foram sincronizadas com sucesso",
      })
    } catch (error: any) {
      console.error('Erro na sincronização:', error)
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Informações da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 space-y-4">
            <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
            <p className="text-muted-foreground">Carregando informações da assinatura...</p>
          </div>
        ) : subscriptionData ? (
          <div className="space-y-6">
            <SubscriptionDetails subscriptionData={subscriptionData} />
            <div className="flex justify-center">
              <Button onClick={syncSubscriptionData} disabled={syncing} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Dados'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <p className="text-muted-foreground">Nenhuma assinatura encontrada</p>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Não foi possível carregar os dados da assinatura</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Verifique se você possui uma assinatura ativa
                </p>
              </div>
            </div>
            <Button onClick={syncSubscriptionData} disabled={syncing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Tentando novamente...' : 'Tentar Novamente'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
