import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useLocalAuth';
import { toast } from 'sonner';

export interface Category {
  id: string;
  nome: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
  userid: string;
}

// Default categories for demo
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    nome: 'Alimentação',
    tags: 'comida, restaurante, supermercado',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    userid: 'demo'
  },
  {
    id: '2',
    nome: 'Transporte',
    tags: 'gasolina, uber, ônibus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    userid: 'demo'
  },
  {
    id: '3',
    nome: 'Saúde',
    tags: 'médico, farmácia, plano de saúde',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    userid: 'demo'
  },
  {
    id: '4',
    nome: 'Entretenimento',
    tags: 'cinema, streaming, jogos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    userid: 'demo'
  },
  {
    id: '5',
    nome: 'Trabalho',
    tags: 'salário, freelance, vendas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    userid: 'demo'
  }
];

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = () => {
    const stored = localStorage.getItem('jsap-categories');
    if (stored) {
      try {
        setCategories(JSON.parse(stored));
      } catch (error) {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem('jsap-categories', JSON.stringify(DEFAULT_CATEGORIES));
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('jsap-categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
  };

  const createCategory = async (newCategory: { nome: string; tags?: string }) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    try {
      const category: Category = {
        id: Date.now().toString(),
        nome: newCategory.nome,
        tags: newCategory.tags || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        userid: user.id
      };

      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      localStorage.setItem('jsap-categories', JSON.stringify(updatedCategories));
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar categoria');
    }
    setIsLoading(false);
  };

  const updateCategory = async ({ id, updates }: { id: string; updates: { nome: string; tags?: string } }) => {
    setIsLoading(true);
    try {
      const updatedCategories = categories.map(cat => {
        if (cat.id === id) {
          return {
            ...cat,
            nome: updates.nome,
            tags: updates.tags || null,
            updated_at: new Date().toISOString()
          };
        }
        return cat;
      });

      setCategories(updatedCategories);
      localStorage.setItem('jsap-categories', JSON.stringify(updatedCategories));
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
    }
    setIsLoading(false);
  };

  const deleteCategory = async (id: string) => {
    setIsLoading(true);
    try {
      const updatedCategories = categories.filter(cat => cat.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem('jsap-categories', JSON.stringify(updatedCategories));
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    }
    setIsLoading(false);
  };

  return {
    categories,
    isLoading,
    error: null,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating: isLoading,
    isUpdating: isLoading,
    isDeleting: isLoading,
  };
}