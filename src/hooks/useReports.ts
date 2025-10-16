
import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useLocalAuth'
import { supabase } from '@/integrations/supabase/client'

export interface ReportTransaction {
  id: number
  created_at: string
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  detalhes: string | null
  tipo: string | null
  category_id: string
  categorias?: {
    id: string
    nome: string
    tipo: string
    icon?: string
    color?: string
  }
}

export interface ReportFilters {
  startDate: string
  endDate: string
  type: string
  categoryId: string
  period: 'day' | 'month' | 'year' | 'custom'
}

export function useReports() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<ReportTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    type: '',
    categoryId: '',
    period: 'month'
  })

  const fetchTransactions = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      let query = supabase
        .from('transacoes')
        .select(`
          *,
          categorias(id, nome, tipo, icon, color)
        `)
        .eq('userid', user.id)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.type) {
        query = query.eq('tipo', filters.type)
      }
      
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      // Apply date filters based on period
      const now = new Date()
      let startDate: Date | null = null
      let endDate: Date | null = null

      switch (filters.period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear() + 1, 0, 1)
          break
        case 'custom':
          if (filters.startDate) startDate = new Date(filters.startDate)
          if (filters.endDate) endDate = new Date(filters.endDate)
          break
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lt('created_at', endDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [user, filters])

  // Calculate summary data
  const summaryData = useMemo(() => {
    const receitas = transactions
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const despesas = transactions
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const saldo = receitas - despesas

    // Group by category
    const byCategory = transactions.reduce((acc, transaction) => {
      const categoryName = transaction.categorias?.nome || 'Sem categoria'
      const valor = transaction.valor || 0
      
      if (!acc[categoryName]) {
        acc[categoryName] = { receitas: 0, despesas: 0, total: 0 }
      }
      
      if (transaction.tipo === 'receita') {
        acc[categoryName].receitas += valor
      } else {
        acc[categoryName].despesas += valor
      }
      
      acc[categoryName].total = acc[categoryName].receitas - acc[categoryName].despesas
      
      return acc
    }, {} as Record<string, { receitas: number; despesas: number; total: number }>)

    // Group by type for chart data
    const chartData = [
      { name: 'Receitas', value: receitas, color: '#22c55e' },
      { name: 'Despesas', value: despesas, color: '#ef4444' }
    ]

    return {
      receitas,
      despesas,
      saldo,
      byCategory,
      chartData,
      totalTransactions: transactions.length
    }
  }, [transactions])

  return {
    transactions,
    isLoading,
    filters,
    setFilters,
    summaryData
  }
}
