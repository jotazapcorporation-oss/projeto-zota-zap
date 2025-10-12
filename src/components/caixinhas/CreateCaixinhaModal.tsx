import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface CreateCaixinhaModalProps {
  onCreateCaixinha: (nome: string, valorMeta: number) => Promise<any>;
}

export function CreateCaixinhaModal({ onCreateCaixinha }: CreateCaixinhaModalProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valorMeta, setValorMeta] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const valor = parseFloat(valorMeta);
    if (!nome.trim() || isNaN(valor) || valor <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onCreateCaixinha(nome.trim(), valor);
      setNome("");
      setValorMeta("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Nova Caixinha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Caixinha</DialogTitle>
            <DialogDescription>
              Defina um nome e uma meta de valor para sua nova caixinha de poupança.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Caixinha</Label>
              <Input
                id="nome"
                placeholder="Ex: Viagem para a Europa"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor-meta">Valor Total da Meta (R$)</Label>
              <Input
                id="valor-meta"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={valorMeta}
                onChange={(e) => setValorMeta(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !nome.trim() || !valorMeta}>
              {loading ? "Criando..." : "Criar Caixinha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
