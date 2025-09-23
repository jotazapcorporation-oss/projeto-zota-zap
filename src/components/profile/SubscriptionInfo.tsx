
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useLocalAuth'
import { toast } from '@/hooks/use-toast'
import { CreditCard, RefreshCw, AlertCircle } from 'lucide-react'

export function SubscriptionInfo() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const syncSubscriptionData = async () => {
    try {
      setSyncing(true)
      // Database tables don't exist yet
      toast({
        title: "Banco de dados indisponível",
        description: "Aguarde a recriação das tabelas para usar esta funcionalidade",
        variant: "destructive",
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
        <div className="text-center py-8 space-y-4">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <p className="text-muted-foreground">Banco de dados indisponível</p>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Aguarde a recriação das tabelas</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                As tabelas do banco de dados foram removidas e precisam ser recriadas
              </p>
            </div>
          </div>
          <Button onClick={syncSubscriptionData} disabled={syncing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Aguardando...' : 'Aguardar Recriação'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
