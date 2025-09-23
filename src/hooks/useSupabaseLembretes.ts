import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useLocalAuth'
import { toast } from '@/hooks/use-toast'

export interface Lembrete {
  id: number
  created_at: string
  userid: string
  descricao: string | null
  data: string | null
  valor: number | null
}

export function useSupabaseLembretes() {
  const { user, session } = useAuth()
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && session) {
      fetchLembretes()
    }
  }, [user, session])

  const fetchLembretes = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('lembretes')
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching lembretes:', error)
        setError(error.message)
        toast({
          title: "Erro ao carregar lembretes",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setLembretes(data || [])
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      setError('Erro inesperado ao carregar lembretes')
      toast({
        title: "Erro ao carregar lembretes",
        description: "Erro inesperado ao carregar lembretes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createLembrete = async (lembrete: { descricao: string; data?: string; valor?: number }) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('lembretes')
        .insert([
          {
            descricao: lembrete.descricao,
            data: lembrete.data || null,
            valor: lembrete.valor || null,
            userid: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating lembrete:', error)
        toast({
          title: "Erro ao criar lembrete",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setLembretes(prev => [data, ...prev])
        toast({
          title: "Sucesso!",
          description: "Lembrete criado com sucesso!",
        })
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: "Erro ao criar lembrete",
        description: "Erro inesperado ao criar lembrete",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateLembrete = async (id: number, updates: { descricao?: string; data?: string; valor?: number }) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('lembretes')
        .update(updates)
        .eq('id', id)
        .eq('userid', user?.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating lembrete:', error)
        toast({
          title: "Erro ao atualizar lembrete",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setLembretes(prev => 
          prev.map(lembrete => lembrete.id === id ? data : lembrete)
        )
        toast({
          title: "Sucesso!",
          description: "Lembrete atualizado com sucesso!",
        })
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: "Erro ao atualizar lembrete",
        description: "Erro inesperado ao atualizar lembrete",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteLembrete = async (id: number) => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('lembretes')
        .delete()
        .eq('id', id)
        .eq('userid', user?.id)

      if (error) {
        console.error('Error deleting lembrete:', error)
        toast({
          title: "Erro ao excluir lembrete",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setLembretes(prev => prev.filter(lembrete => lembrete.id !== id))
        toast({
          title: "Sucesso!",
          description: "Lembrete excluído com sucesso!",
        })
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: "Erro ao excluir lembrete",
        description: "Erro inesperado ao excluir lembrete",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAllLembretes = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('lembretes')
        .delete()
        .eq('userid', user.id)

      if (error) {
        console.error('Error deleting all lembretes:', error)
        toast({
          title: "Erro ao excluir lembretes",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setLembretes([])
        toast({
          title: "Sucesso!",
          description: "Todos os lembretes foram excluídos!",
        })
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: "Erro ao excluir lembretes",
        description: "Erro inesperado ao excluir lembretes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    lembretes,
    isLoading,
    error,
    createLembrete,
    updateLembrete,
    deleteLembrete,
    deleteAllLembretes,
    refetch: fetchLembretes,
  }
}