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

  // Buscar estatísticas de usuários
  const userStats = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      // Total de usuários ativos
      const { count: totalUsers, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      if (totalError) throw totalError;

      // Total de usuários pagantes (com assinaturaid preenchido)
      const { count: payingUsers, error: payingError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('assinaturaid', 'is', null)
        .neq('assinaturaid', '');

      if (payingError) throw payingError;

      // Total de usuários criados grátis (sem assinaturaid)
      const { count: freeUsers, error: freeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .or('assinaturaid.is.null,assinaturaid.eq.');

      if (freeError) throw freeError;

      return {
        totalUsers: totalUsers || 0,
        payingUsers: payingUsers || 0,
        freeUsers: freeUsers || 0,
      };
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Listar usuários com paginação e busca
  const listUsers = useQuery({
    queryKey: ['admin-users', page, pageSize, searchTerm],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('profiles')
        .select('id, nome, email, phone, admin, ativo, created_at, avatar_url, assinaturaid', { count: 'exact' })
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
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      toast.success(active ? 'Usuário ativado!' : 'Usuário desativado!');
    },
    onError: () => {
      toast.error('Erro ao alterar status do usuário');
    },
  });

  // Excluir usuário permanentemente
  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      toast.success('Usuário e todos os seus dados foram excluídos permanentemente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir usuário');
    },
  });

  return {
    userStats,
    listUsers,
    createUser,
    updateUser,
    toggleUserActive,
    deleteUser,
  };
};
