
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useLocalAuth'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { TutorialButton } from '@/components/ui/tutorial-button'
import { TutorialModal } from '@/components/ui/tutorial-modal'
import { useTutorial } from '@/hooks/useTutorial'
import { PageTransition } from '@/components/layout/PageTransition'
import { Home } from 'lucide-react'

interface Transacao {
  id: number
  created_at: string
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  detalhes: string | null
  tipo: string | null
  category_id: string
  userid: string | null
  categorias?: {
    id: string
    nome: string
  }
}

interface Lembrete {
  id: number
  created_at: string
  userid: string | null
  descricao: string | null
  data: string | null
  valor: number | null
}

interface FraseDiaria {
  id: string
  mensagem: string
  autor: string | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [fraseDiaria, setFraseDiaria] = useState<FraseDiaria | null>(null)
  const [loading, setLoading] = useState(true)
  const tutorial = useTutorial('dashboard')
  
  // Estados dos filtros
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      setLoading(true)
      
      // Buscar transações com categorias
      const txRes = await supabase
        .from('transacoes')
        .select('*, categorias!transacoes_category_id_fkey(id, nome)')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })

      // Buscar lembretes
      const lbRes = await supabase
        .from('lembretes')
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })

      // Buscar frase diária com tipagem explícita
      const fraseRes = await supabase
        .from('frasediaria' as any)
        .select('*')
        .limit(100) as { data: FraseDiaria[] | null; error: any }

      if (txRes.error) {
        console.error('Erro ao carregar transações:', txRes.error)
        toast({ title: 'Erro ao carregar transações', description: txRes.error.message, variant: 'destructive' })
        setTransacoes([])
      } else {
        setTransacoes(txRes.data || [])
      }

      if (lbRes.error) {
        console.error('Erro ao carregar lembretes:', lbRes.error)
        toast({ title: 'Erro ao carregar lembretes', description: lbRes.error.message, variant: 'destructive' })
        setLembretes([])
      } else {
        setLembretes(lbRes.data || [])
      }

      if (fraseRes.error) {
        console.error('Erro ao carregar frase diária:', fraseRes.error)
        setFraseDiaria(null)
      } else if (fraseRes.data && fraseRes.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * fraseRes.data.length)
        setFraseDiaria(fraseRes.data[randomIndex])
      } else {
        setFraseDiaria(null)
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error)
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar transações por mês e ano
  const filteredTransacoes = useMemo(() => {
    console.log('Total transacoes:', transacoes.length)
    console.log('Filter month:', filterMonth, 'Filter year:', filterYear)
    
    const filtered = transacoes.filter(transacao => {
      if (!transacao.quando) {
        console.log('Transacao sem data:', transacao)
        return false
      }
      
      console.log('Processando transacao:', transacao.quando, 'tipo:', transacao.tipo, 'valor:', transacao.valor)
      
      // Parse date in dd/MM/yyyy or yyyy-MM-dd format
      let transacaoMonth: number
      let transacaoYear: number
      
      if (transacao.quando.includes('/')) {
        // Format: dd/MM/yyyy
        const [day, month, year] = transacao.quando.split('/')
        transacaoMonth = parseInt(month) - 1 // JS months are 0-indexed
        transacaoYear = parseInt(year)
      } else {
        // Format: yyyy-MM-dd
        const date = new Date(transacao.quando)
        transacaoMonth = date.getMonth()
        transacaoYear = date.getFullYear()
      }
      
      const matches = transacaoMonth === parseInt(filterMonth) && 
                      transacaoYear === parseInt(filterYear)
      
      console.log('Match?', matches, '- Transacao:', transacaoMonth, transacaoYear, 'Filter:', filterMonth, filterYear)
      
      return matches
    })
    
    console.log('Filtered transacoes:', filtered.length)
    return filtered
  }, [transacoes, filterMonth, filterYear])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalReceitas = filteredTransacoes
      .filter(t => t.tipo?.toLowerCase() === 'receita')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const totalDespesas = filteredTransacoes
      .filter(t => t.tipo?.toLowerCase() === 'despesa')
      .reduce((acc, t) => acc + Math.abs(t.valor || 0), 0)
    
    const saldo = totalReceitas - totalDespesas
    
    const lembretesCount = lembretes.filter(l => {
      if (!l.data) return false
      const lembreteDate = new Date(l.data)
      return lembreteDate.getMonth() === parseInt(filterMonth) && 
             lembreteDate.getFullYear() === parseInt(filterYear)
    }).length

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      transacoesCount: filteredTransacoes.length,
      lembretesCount
    }
  }, [filteredTransacoes, lembretes, filterMonth, filterYear])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <PageTransition
      title="Dashboard"
      description="Visão geral das suas finanças"
      icon={Home}
    >
      <div className="flex items-center justify-end mb-4">
        <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
      </div>

      <DashboardFilters 
        filterMonth={filterMonth}
        filterYear={filterYear}
        setFilterMonth={setFilterMonth}
        setFilterYear={setFilterYear}
        transactionCount={filteredTransacoes.length}
      />
      
      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts transacoes={filteredTransacoes} />
        </div>
        <div>
          <DashboardSidebar lembretes={lembretes} fraseDiaria={fraseDiaria} />
        </div>
      </div>

      <TutorialModal
        isOpen={tutorial.isOpen}
        onClose={() => tutorial.setIsOpen(false)}
        sectionId="dashboard"
        progress={tutorial.progress}
        onToggleStep={tutorial.toggleStep}
        onReset={tutorial.resetProgress}
      />
    </PageTransition>
  )
}
