import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lista, Card } from './useSupabaseBoards';

export const useSupabaseListas = (boardId: string | null) => {
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchListas = async () => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch listas
      const { data: listasData, error: listasError } = await supabase
        .from('listas')
        .select('*')
        .eq('board_id', boardId)
        .order('display_order', { ascending: true });

      if (listasError) throw listasError;

      // Fetch cards for all listas
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('lista_id', (listasData || []).map(l => l.id))
        .order('display_order', { ascending: true });

      if (cardsError) throw cardsError;

      // Map cards by data type
      const mappedCards: Card[] = (cardsData || []).map(card => ({
        ...card,
        etiquetas: (card.etiquetas as any) || [],
        checklist: (card.checklist as any) || [],
      }));

      // Combine listas with their cards
      const listasWithCards: Lista[] = (listasData || []).map(lista => ({
        ...lista,
        cards: mappedCards.filter(card => card.lista_id === lista.id),
      }));

      setListas(listasWithCards);
    } catch (error: any) {
      console.error('Error fetching listas:', error);
      toast({
        title: "Erro ao carregar listas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLista = async (titulo: string) => {
    if (!boardId) return;

    try {
      const { data, error } = await supabase
        .from('listas')
        .insert({
          board_id: boardId,
          titulo,
          display_order: listas.length,
        })
        .select()
        .single();

      if (error) throw error;

      const newLista: Lista = { ...data, cards: [] };
      setListas((prev) => [...prev, newLista]);
      toast({
        title: "Lista criada",
        description: "Sua lista foi criada com sucesso!",
      });
      return newLista;
    } catch (error: any) {
      console.error('Error creating lista:', error);
      toast({
        title: "Erro ao criar lista",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateLista = async (id: string, updates: Partial<Lista>) => {
    try {
      const { error } = await supabase
        .from('listas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setListas((prev) =>
        prev.map((lista) => (lista.id === id ? { ...lista, ...updates } : lista))
      );
    } catch (error: any) {
      console.error('Error updating lista:', error);
      toast({
        title: "Erro ao atualizar lista",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteLista = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListas((prev) => prev.filter((lista) => lista.id !== id));
      toast({
        title: "Lista excluída",
        description: "Sua lista foi excluída com sucesso!",
      });
    } catch (error: any) {
      console.error('Error deleting lista:', error);
      toast({
        title: "Erro ao excluir lista",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateListasOrder = async (newListas: Lista[]) => {
    try {
      const updates = newListas.map((lista, index) => ({
        id: lista.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('listas')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      setListas(newListas);
    } catch (error: any) {
      console.error('Error updating listas order:', error);
      toast({
        title: "Erro ao reordenar listas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchListas();
  }, [boardId]);

  return {
    listas,
    loading,
    setListas,
    fetchListas,
    createLista,
    updateLista,
    deleteLista,
    updateListasOrder,
  };
};
