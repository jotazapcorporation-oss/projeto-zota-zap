import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useLocalAuth'
import { toast } from 'sonner'

export interface Category {
  id: string
  nome: string
  tags: string | null
  tipo?: 'receita' | 'despesa' | null
  created_at: string
  updated_at: string
  userid: string
}

export function useSupabaseCategories() {
  const { user, session } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && session) {
      fetchCategories()
    }
  }, [user, session])

  const fetchCategories = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching categories:', error)
        setError(error.message)
        toast.error('Erro ao carregar categorias')
      } else {
        setCategories((data || []) as Category[])
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      setError('Erro inesperado ao carregar categorias')
      toast.error('Erro inesperado ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }

  const createCategory = async (newCategory: { nome: string; tags?: string; tipo?: 'receita' | 'despesa' }) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return null
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([
          {
            nome: newCategory.nome,
            tags: newCategory.tags || null,
            tipo: newCategory.tipo || 'despesa',
            userid: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        toast.error('Erro ao criar categoria')
        return null
      } else {
        setCategories(prev => [data as Category, ...prev])
        toast.success('Categoria criada com sucesso!')
        return data as Category
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast.error('Erro inesperado ao criar categoria')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateCategory = async ({ id, updates }: { id: string; updates: { nome: string; tags?: string; tipo?: 'receita' | 'despesa' } }) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('categorias')
        .update({
          nome: updates.nome,
          tags: updates.tags || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('userid', user?.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating category:', error)
        toast.error('Erro ao atualizar categoria')
      } else {
        setCategories(prev => 
          prev.map(cat => cat.id === id ? data as Category : cat)
        )
        toast.success('Categoria atualizada com sucesso!')
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast.error('Erro inesperado ao atualizar categoria')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('userid', user?.id)

      if (error) {
        console.error('Error deleting category:', error)
        toast.error('Erro ao excluir categoria')
      } else {
        setCategories(prev => prev.filter(cat => cat.id !== id))
        toast.success('Categoria excluída com sucesso!')
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast.error('Erro inesperado ao excluir categoria')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating: isLoading,
    isUpdating: isLoading,
    isDeleting: isLoading,
    refetch: fetchCategories,
  }
}