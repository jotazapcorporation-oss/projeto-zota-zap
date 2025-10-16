import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
}

export interface Etiqueta {
  id: string;
  texto: string;
  cor: string;
}

export interface Card {
  id: string;
  lista_id: string;
  titulo: string;
  descricao?: string;
  data_vencimento?: string;
  cover_image?: string | null;
  etiquetas: Etiqueta[];
  checklist: ChecklistItem[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lista {
  id: string;
  board_id: string;
  titulo: string;
  display_order: number;
  cards: Card[];
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  icone: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useSupabaseBoards = (userId: string | undefined) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBoards = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBoards(data || []);
    } catch (error: any) {
      console.error('Error fetching boards:', error);
      toast({
        title: "Erro ao carregar quadros",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (boardData: Omit<Board, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('boards')
        .insert({
          ...boardData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setBoards((prev) => [...prev, data]);
      toast({
        title: "Quadro criado",
        description: "Seu quadro foi criado com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error('Error creating board:', error);
      toast({
        title: "Erro ao criar quadro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    try {
      const { error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setBoards((prev) =>
        prev.map((board) => (board.id === id ? { ...board, ...updates } : board))
      );
    } catch (error: any) {
      console.error('Error updating board:', error);
      toast({
        title: "Erro ao atualizar quadro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setBoards((prev) => prev.filter((board) => board.id !== id));
      toast({
        title: "Quadro excluído",
        description: "Seu quadro foi excluído com sucesso!",
      });
    } catch (error: any) {
      console.error('Error deleting board:', error);
      toast({
        title: "Erro ao excluir quadro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [userId]);

  return {
    boards,
    loading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
  };
};
