import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgendaEvent {
  id: string;
  user_id: string;
  titulo: string;
  event_date: string;
  event_time: string;
  local: string | null;
  created_at: string;
  updated_at: string;
}

export const useSupabaseAgenda = (userId: string | undefined) => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('agenda_eventos')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      // @ts-ignore
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Erro ao carregar eventos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<AgendaEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!userId) return;

    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('agenda_eventos')
        // @ts-ignore
        .insert([{ ...eventData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✅ Evento criado!',
        description: `${eventData.titulo} adicionado à agenda`,
      });

      await fetchEvents();
      return data;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: 'Erro ao criar evento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<AgendaEvent>) => {
    try {
      const { error } = await supabase
        .from('agenda_eventos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '✏️ Evento atualizado',
        description: 'As alterações foram salvas',
      });

      await fetchEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: 'Erro ao atualizar evento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agenda_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '🗑️ Evento excluído',
        description: 'O evento foi removido da agenda',
      });

      await fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Erro ao excluir evento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
