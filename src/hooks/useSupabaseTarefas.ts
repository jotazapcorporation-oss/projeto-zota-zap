import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subtarefa {
  id: string;
  texto: string;
  concluida: boolean;
}

export interface Tarefa {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  local?: string;
  horario?: string;
  prioridade: 'urgente' | 'fazer_depois' | 'normal';
  concluida: boolean;
  display_order: number;
  subtarefas: Subtarefa[];
  created_at: string;
  updated_at: string;
}

export const useSupabaseTarefas = (userId: string | undefined) => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTarefas = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const mappedData: Tarefa[] = (data || []).map(item => ({
        ...item,
        prioridade: item.prioridade as 'urgente' | 'fazer_depois' | 'normal',
        subtarefas: (item.subtarefas as any) || []
      }));
      
      setTarefas(mappedData);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Erro ao carregar tarefas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTarefa = async (tarefaData: Omit<Tarefa, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('tarefas')
        .insert({
          titulo: tarefaData.titulo,
          descricao: tarefaData.descricao,
          local: tarefaData.local,
          horario: tarefaData.horario,
          prioridade: tarefaData.prioridade,
          concluida: tarefaData.concluida,
          display_order: tarefaData.display_order,
          subtarefas: tarefaData.subtarefas as any,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      const mappedData: Tarefa = {
        ...data,
        prioridade: data.prioridade as 'urgente' | 'fazer_depois' | 'normal',
        subtarefas: (data.subtarefas as any) || []
      };

      setTarefas((prev) => [...prev, mappedData]);
      toast({
        title: "Tarefa criada",
        description: "Sua tarefa foi criada com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTarefa = async (id: string, updates: Partial<Tarefa>) => {
    try {
      const updateData: any = {};
      if (updates.titulo !== undefined) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.local !== undefined) updateData.local = updates.local;
      if (updates.horario !== undefined) updateData.horario = updates.horario;
      if (updates.prioridade !== undefined) updateData.prioridade = updates.prioridade;
      if (updates.concluida !== undefined) updateData.concluida = updates.concluida;
      if (updates.display_order !== undefined) updateData.display_order = updates.display_order;
      if (updates.subtarefas !== undefined) updateData.subtarefas = updates.subtarefas;

      const { error } = await supabase
        .from('tarefas')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setTarefas((prev) =>
        prev.map((tarefa) => (tarefa.id === id ? { ...tarefa, ...updates } : tarefa))
      );
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTarefa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== id));
      toast({
        title: "Tarefa excluída",
        description: "Sua tarefa foi excluída com sucesso!",
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateOrdem = async (tarefasReordenadas: Tarefa[]) => {
    try {
      const updates = tarefasReordenadas.map((tarefa, index) => ({
        id: tarefa.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('tarefas')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
          .eq('user_id', userId);
      }

      setTarefas(tarefasReordenadas);
    } catch (error: any) {
      console.error('Error updating task order:', error);
      toast({
        title: "Erro ao reordenar tarefas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTarefas();
  }, [userId]);

  return {
    tarefas,
    loading,
    fetchTarefas,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    updateOrdem,
  };
};
