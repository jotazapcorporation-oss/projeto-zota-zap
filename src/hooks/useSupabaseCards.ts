import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from './useSupabaseBoards';

export const useSupabaseCards = () => {
  const { toast } = useToast();

  const createCard = async (listaId: string, cardData: Omit<Card, 'id' | 'lista_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          lista_id: listaId,
          titulo: cardData.titulo,
          descricao: cardData.descricao,
          data_vencimento: cardData.data_vencimento,
          etiquetas: cardData.etiquetas as any,
          checklist: cardData.checklist as any,
          display_order: cardData.display_order,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Card criado",
        description: "Seu card foi criado com sucesso!",
      });

      return {
        ...data,
        etiquetas: (data.etiquetas as any) || [],
        checklist: (data.checklist as any) || [],
      } as Card;
    } catch (error: any) {
      console.error('Error creating card:', error);
      toast({
        title: "Erro ao criar card",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    try {
      const updateData: any = {};
      if (updates.titulo !== undefined) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.data_vencimento !== undefined) updateData.data_vencimento = updates.data_vencimento;
      if (updates.display_order !== undefined) updateData.display_order = updates.display_order;
      if (updates.lista_id !== undefined) updateData.lista_id = updates.lista_id;
      if (updates.etiquetas !== undefined) updateData.etiquetas = updates.etiquetas as any;
      if (updates.checklist !== undefined) updateData.checklist = updates.checklist as any;

      const { error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating card:', error);
      toast({
        title: "Erro ao atualizar card",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Card excluído",
        description: "Seu card foi excluído com sucesso!",
      });
    } catch (error: any) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro ao excluir card",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveCard = async (cardId: string, newListaId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({
          lista_id: newListaId,
          display_order: newOrder,
        })
        .eq('id', cardId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error moving card:', error);
      toast({
        title: "Erro ao mover card",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  };
};
