import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Trash2, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  
  // Estados para edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDependente, setEditingDependente] = useState<Dependente | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editing, setEditing] = useState(false);

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

      const { data, error } = await supabase.from("family_plan").select("*").eq("master_id", user.id).single();

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
      
      // Recarregar dependentes e plano após adicionar
      await fetchDependentes();
      await fetchMasterPlan();
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

  const handleDeleteDependente = async (dependenteId: string) => {
    if (!confirm("Tem certeza que deseja excluir este dependente?")) {
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const response = await fetch("https://webhook.jzap.net/webhook/dependentes/excluir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic VVNVQVJJTzpTRU5IQQ==",
        },
        body: JSON.stringify({
          dependente_id: dependenteId,
          master_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir dependente");
      }

      toast({
        title: "Sucesso!",
        description: "Dependente excluído com sucesso.",
      });

      // Recarregar dependentes e plano após excluir
      await fetchDependentes();
      await fetchMasterPlan();
    } catch (error: any) {
      console.error("Erro ao excluir dependente:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o dependente",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditModal = (dependente: Dependente) => {
    setEditingDependente(dependente);
    setEditName(dependente.nome || "");
    setEditEmail(dependente.email || "");
    setEditWhatsapp(dependente.whatsapp || dependente.phone || "");
    setEditModalOpen(true);
  };

  const handleEditDependente = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim() || !editEmail.trim() || !editWhatsapp.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (!editingDependente) return;

    setEditing(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const response = await fetch("https://webhook.jzap.net/webhook/dependentes/editar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic VVNVQVJJTzpTRU5IQQ==",
        },
        body: JSON.stringify({
          dependente_id: editingDependente.id,
          master_id: user.id,
          nome: editName,
          email: editEmail,
          whatsapp: editWhatsapp,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao editar dependente");
      }

      toast({
        title: "Sucesso!",
        description: "Dependente editado com sucesso.",
      });

      setEditModalOpen(false);
      setEditingDependente(null);
      
      // Recarregar dependentes e plano após editar
      await fetchDependentes();
      await fetchMasterPlan();
    } catch (error: any) {
      console.error("Erro ao editar dependente:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível editar o dependente",
        variant: "destructive",
      });
    } finally {
      setEditing(false);
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
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Seu plano atual não possui a funcionalidade de dependentes. Adquira o Plano Família para adicionar
            dependentes à sua conta.
          </p>
          <Button
            onClick={() => window.open("LINK_PARA_ADQUIRIR_PLANO_FAMILIA", "_blank")}
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Adquirir Plano Família
          </Button>
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
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(dep)}
                          className="hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDependente(dep.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Dependente</DialogTitle>
            <DialogDescription>
              Atualize as informações do dependente abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDependente} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Dependente</Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="Ex: João da Silva"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail do Dependente</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Ex: joao@email.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-whatsapp">Número do Dependente (WhatsApp)</Label>
              <Input
                id="edit-whatsapp"
                type="tel"
                placeholder="Ex: 5511999999999"
                value={editWhatsapp}
                onChange={(e) => setEditWhatsapp(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Digite o número com código do país e DDD (ex: 5511999999999)
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={editing}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editing}>
                {editing ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
