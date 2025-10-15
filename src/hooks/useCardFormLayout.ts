import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useLocalAuth';
import { useToast } from '@/hooks/use-toast';

export type FormFieldId = 'titulo' | 'descricao' | 'data_vencimento' | 'etiquetas' | 'checklist';

const DEFAULT_FIELD_ORDER: FormFieldId[] = [
  'titulo',
  'descricao',
  'checklist',
  'data_vencimento',
  'etiquetas'
];

export const useCardFormLayout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fieldOrder, setFieldOrder] = useState<FormFieldId[]>(DEFAULT_FIELD_ORDER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFieldOrder();
  }, [user?.id]);

  const fetchFieldOrder = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('card_form_field_order')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.card_form_field_order && Array.isArray(data.card_form_field_order)) {
        setFieldOrder(data.card_form_field_order as FormFieldId[]);
      }
    } catch (error: any) {
      console.error('Error fetching field order:', error);
      // Silently fail and use default order
    } finally {
      setLoading(false);
    }
  };

  const saveFieldOrder = async (newOrder: FormFieldId[]) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ card_form_field_order: newOrder })
        .eq('id', user.id);

      if (error) throw error;

      setFieldOrder(newOrder);
      
      toast({
        title: "Layout salvo",
        description: "A ordem dos campos foi personalizada com sucesso!",
      });
    } catch (error: any) {
      console.error('Error saving field order:', error);
      toast({
        title: "Erro ao salvar layout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetToDefault = async () => {
    await saveFieldOrder(DEFAULT_FIELD_ORDER);
  };

  return {
    fieldOrder,
    loading,
    saveFieldOrder,
    resetToDefault,
  };
};
