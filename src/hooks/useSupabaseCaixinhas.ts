import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Caixinha {
  id: string;
  user_id: string;
  nome_caixinha: string;
  valor_meta: number;
  valor_atual: number;
  data_criacao: string;
  updated_at: string;
  goal_icon?: string;
  card_color?: string;
  deadline_date?: string;
  display_order?: number;
}

export function useSupabaseCaixinhas() {
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldoGeral, setSaldoGeral] = useState(0);

  const fetchCaixinhas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar caixinhas
      const { data: caixinhasData, error: caixinhasError } = await supabase
        .from("caixinhas_poupanca")
        .select("*")
        .eq("user_id", user.id)
        .order("display_order", { ascending: true });

      if (caixinhasError) throw caixinhasError;

      setCaixinhas(caixinhasData || []);

      // Buscar saldo geral do usuário
      // @ts-ignore - Avoiding circular type reference in Supabase types
      const profileResponse = await supabase
        .from("profiles")
        .select("saldo")
        .eq("id", user.id)
        .maybeSingle();

      if (profileResponse.error) throw profileResponse.error;

      setSaldoGeral(profileResponse.data?.saldo || 0);
    } catch (error: any) {
      console.error("Erro ao buscar caixinhas:", error);
      toast({
        title: "Erro ao carregar caixinhas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCaixinha = async (
    nome: string, 
    valorMeta: number, 
    goalIcon?: string, 
    cardColor?: string, 
    deadlineDate?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Obter o próximo display_order
      const { data: existingCaixinhas } = await supabase
        .from("caixinhas_poupanca")
        .select("display_order")
        .eq("user_id", user.id)
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = existingCaixinhas && existingCaixinhas.length > 0 
        ? (existingCaixinhas[0].display_order || 0) + 1 
        : 0;

      const { data, error } = await supabase
        .from("caixinhas_poupanca")
        .insert([
          {
            user_id: user.id,
            nome_caixinha: nome,
            valor_meta: valorMeta,
            valor_atual: 0,
            goal_icon: goalIcon || 'piggy-bank',
            card_color: cardColor || 'default',
            deadline_date: deadlineDate || null,
            display_order: nextOrder,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Caixinha criada!",
        description: `${nome} foi criada com sucesso.`,
      });

      await fetchCaixinhas();
      return data;
    } catch (error: any) {
      console.error("Erro ao criar caixinha:", error);
      toast({
        title: "Erro ao criar caixinha",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const depositar = async (caixinhaId: string, valor: number) => {
    try {
      const { data, error } = await supabase.rpc("depositar_caixinha", {
        _caixinha_id: caixinhaId,
        _valor: valor,
      });

      if (error) throw error;

      toast({
        title: "Depósito realizado!",
        description: `R$ ${valor.toFixed(2)} depositados com sucesso.`,
      });

      await fetchCaixinhas();
      return data;
    } catch (error: any) {
      console.error("Erro ao depositar:", error);
      toast({
        title: "Erro ao depositar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const retirar = async (caixinhaId: string, valor: number) => {
    try {
      const { data, error } = await supabase.rpc("retirar_caixinha", {
        _caixinha_id: caixinhaId,
        _valor: valor,
      });

      if (error) throw error;

      toast({
        title: "Retirada realizada!",
        description: `R$ ${valor.toFixed(2)} retirados com sucesso.`,
      });

      await fetchCaixinhas();
      return data;
    } catch (error: any) {
      console.error("Erro ao retirar:", error);
      toast({
        title: "Erro ao retirar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCaixinha = async (
    caixinhaId: string, 
    updates: Partial<Caixinha>
  ) => {
    try {
      const { error } = await supabase
        .from("caixinhas_poupanca")
        .update(updates)
        .eq("id", caixinhaId);

      if (error) throw error;

      toast({
        title: "Caixinha atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });

      await fetchCaixinhas();
    } catch (error: any) {
      console.error("Erro ao atualizar caixinha:", error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderCaixinhas = async (newOrder: Caixinha[]) => {
    try {
      const updates = newOrder.map((caixinha, index) => ({
        id: caixinha.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("caixinhas_poupanca")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }

      setCaixinhas(newOrder);
    } catch (error: any) {
      console.error("Erro ao reordenar caixinhas:", error);
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível salvar a nova ordem.",
        variant: "destructive",
      });
    }
  };

  const deleteCaixinha = async (caixinhaId: string) => {
    // Otimista: remove da UI imediatamente e tenta no banco
    const prev = [...caixinhas];
    setCaixinhas((curr) => curr.filter((c) => c.id !== caixinhaId));

    try {
      const { error } = await supabase
        .from("caixinhas_poupanca")
        .delete()
        .eq("id", caixinhaId);

      if (error) throw error;

      toast({
        title: "Caixinha excluída",
        description: "A caixinha foi removida com sucesso.",
      });

      // Recarrega para garantir consistência com o servidor
      await fetchCaixinhas();
    } catch (error: any) {
      console.error("Erro ao excluir caixinha:", error);
      // Rollback otimista
      setCaixinhas(prev);
      toast({
        title: "Erro ao excluir caixinha",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCaixinhas();
  }, []);

  return {
    caixinhas,
    loading,
    saldoGeral,
    fetchCaixinhas,
    createCaixinha,
    depositar,
    retirar,
    deleteCaixinha,
    updateCaixinha,
    reorderCaixinhas,
    setCaixinhas,
  };
}
