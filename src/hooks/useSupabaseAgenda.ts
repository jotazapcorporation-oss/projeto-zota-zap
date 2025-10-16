import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AgendaEvent {
  event_id: string; // unique id of the event row
  id: string;       // user id (RLS)
  titulo: string;
  event_date: string;
  event_time: string; // start time HH:mm
  end_time: string | null; // end time HH:mm
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
        .from("agenda_eventos")
        .select("*")
        .eq("id", userId)
        .order("event_date", { ascending: true });

      if (error) throw error;
      // @ts-ignore
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (
    eventData: Pick<AgendaEvent, "titulo" | "event_date" | "event_time" | "end_time" | "local">
  ) => {
    if (!userId) return;

    try {
      // default end_time = start + 60min when not provided
      const [h, m] = eventData.event_time.split(":").map(Number);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + 60;
      const endH = Math.floor((endMinutes % (24 * 60)) / 60)
        .toString()
        .padStart(2, "0");
      const endM = (endMinutes % 60).toString().padStart(2, "0");
      const payload = {
        titulo: eventData.titulo,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        end_time: eventData.end_time ?? `${endH}:${endM}`,
        local: eventData.local ?? null,
        id: userId, // RLS: owner
      };

      const { data, error } = await supabase
        .from("agenda_eventos")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Evento criado!",
        description: `${eventData.titulo} adicionado à agenda`,
      });

      await fetchEvents();
      return data;
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<AgendaEvent>) => {
    try {
      const { error } = await supabase
        .from("agenda_eventos")
        .update(updates)
        .eq("event_id", eventId)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "✏️ Evento atualizado",
        description: "As alterações foram salvas",
      });

      await fetchEvents();
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Erro ao atualizar evento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("agenda_eventos")
        .delete()
        .eq("event_id", eventId)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "🗑️ Evento excluído",
        description: "O evento foi removido da agenda",
      });

      await fetchEvents();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive",
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
