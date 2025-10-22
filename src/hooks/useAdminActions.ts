import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useLocalAuth';

export interface UserData {
  nome: string;
  email: string;
  phone?: string;
  admin: boolean;
}

export const useAdminActions = (
  page: number = 1,
  pageSize: number = 25,
  searchTerm: string = ''
) => {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // Listar usuários com paginação e busca
  const listUsers = useQuery({
    queryKey: ['admin-users', page, pageSize, searchTerm],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('profiles')
        .select('id, nome, email, phone, admin, ativo, created_at, avatar_url', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtro de busca se existir
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      return { users: data || [], total: count || 0 };
    },
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });

  // Criar novo usuário via webhook
  const createUser = useMutation({
    mutationFn: async (userData: UserData) => {
      const credentials = btoa(`${import.meta.env.VITE_WEBHOOK_USERNAME || 'USUARIO'}:${import.meta.env.VITE_WEBHOOK_PASSWORD || 'SENHA'}`);
      
      const response = await fetch('https://webhook.jzap.net/webhook/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao criar usuário' }));
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar usuário');
    },
  });

  // Atualizar usuário existente
  const updateUser = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserData> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar usuário');
    },
  });

  // Ativar/Desativar usuário
  const toggleUserActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(active ? 'Usuário ativado!' : 'Usuário desativado!');
    },
    onError: () => {
      toast.error('Erro ao alterar status do usuário');
    },
  });

  // Excluir usuário permanentemente
  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário excluído permanentemente');
    },
    onError: () => {
      toast.error('Erro ao excluir usuário');
    },
  });

  return {
    listUsers,
    createUser,
    updateUser,
    toggleUserActive,
    deleteUser,
  };
};
