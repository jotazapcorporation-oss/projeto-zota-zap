import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminSettings {
  id: string;
  use_external_api: boolean;
  external_api_url: string | null;
  updated_at: string;
  updated_by: string | null;
}

export const useAdminSettings = () => {
  const queryClient = useQueryClient();

  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as AdminSettings;
    },
    staleTime: 60000,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: { id: string; use_external_api: boolean; external_api_url: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase
        .from('admin_settings')
        .update({
          use_external_api: updates.use_external_api,
          external_api_url: updates.external_api_url,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar configurações');
    },
  });

  return { settings, updateSettings };
};

/** Helper to get API config for use in mutations */
export const getApiConfig = async (): Promise<{ useExternal: boolean; baseUrl: string | null }> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('use_external_api, external_api_url')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching admin settings:', error);
    return { useExternal: false, baseUrl: null };
  }

  return {
    useExternal: data?.use_external_api ?? false,
    baseUrl: data?.external_api_url ?? null,
  };
};
