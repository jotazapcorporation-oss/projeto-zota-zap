import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MasterPlan {
  limite_de_slots: number;
  slots_utilizados: number;
  status_plano: string;
}

interface Dependente {
  id: string;
  nome: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  created_at: string;
}

export function DependentesTab() {
  const [masterPlan, setMasterPlan] = useState<MasterPlan | null>(null);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [dependentName, setDependentName] = useState("");
  const [dependentEmail, setDependentEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchMasterPlan();
    fetchDependentes();
  }, []);

  const fetchMasterPlan = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("master_users").select("*").eq("master_id", user.id).single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setMasterPlan(data);
    } catch (error: any) {
      console.error("Erro ao carregar plano:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependentes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, email, phone, whatsapp, created_at")
        .eq("master_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDependentes(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar dependentes:", error);
    }
  };

  const handleAddDependente = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dependentName.trim() || !dependentEmail.trim() || !whatsappNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha nome, e-mail e número do WhatsApp do dependente",
        variant: "destructive",
      });
      return;
    }

    if (!masterPlan) {
      toast({
        title: "Erro",
        description: "Plano família não configurado",
        variant: "destructive",
      });
      return;
    }

    if (masterPlan.slots_utilizados >= masterPlan.limite_de_slots) {
      toast({
        title: "Limite atingido",
        description: "Você já atingiu o limite de dependentes do seu plano",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Chamar webhook do n8n
      const response = await fetch("https://webhook.jzap.net/webhook/dependentes/adicionar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic VVNVQVJJTzpTRU5IQQ==",
        },
        body: JSON.stringify({
          nome: dependentName,
          email: dependentEmail,
          whatsapp: whatsappNumber,
          master_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar dependente");
      }

      toast({
        title: "Sucesso!",
        description: "Dependente adicionado com sucesso. Ele receberá as instruções de acesso via WhatsApp.",
      });

      setDependentName("");
      setDependentEmail("");
      setWhatsappNumber("");
      fetchDependentes();
      fetchMasterPlan();
    } catch (error: any) {
      console.error("Erro ao adicionar dependente:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o dependente",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!masterPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Plano Família não disponível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Seu plano atual não possui a funcionalidade de dependentes. Entre em contato com o suporte para mais
            informações.
          </p>
        </CardContent>
      </Card>
    );
  }

  const slotsDisponiveis = masterPlan.limite_de_slots - masterPlan.slots_utilizados;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar dependentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Slots disponíveis</p>
              <p className="text-2xl font-bold">
                {slotsDisponiveis} / {masterPlan.limite_de_slots}
              </p>
            </div>
            <Badge variant={masterPlan.status_plano === "ativo" ? "default" : "destructive"}>
              {masterPlan.status_plano.charAt(0).toUpperCase() + masterPlan.status_plano.slice(1)}
            </Badge>
          </div>

          {slotsDisponiveis > 0 && (
            <form onSubmit={handleAddDependente} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Dependente</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={dependentName}
                  onChange={(e) => setDependentName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail do Dependente</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={dependentEmail}
                  onChange={(e) => setDependentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número do Dependente (WhatsApp)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="Ex: 5511999999999"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Digite o número com código do país e DDD (ex: 5511999999999)
                </p>
              </div>

              <Button type="submit" disabled={adding} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                {adding ? "Adicionando..." : "Adicionar dependente"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {dependentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dependentes cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Data de cadastro</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dependentes.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="font-medium">{dep.nome || "Sem nome"}</TableCell>
                    <TableCell>{dep.email || "Não informado"}</TableCell>
                    <TableCell>{dep.whatsapp || dep.phone || "Não informado"}</TableCell>
                    <TableCell>{new Date(dep.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">Ativo</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
