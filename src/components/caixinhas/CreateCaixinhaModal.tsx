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
import { IconPicker } from "./IconPicker";
import { ColorPicker } from "./ColorPicker";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateCaixinhaModalProps {
  onCreateCaixinha: (
    nome: string, 
    valorMeta: number, 
    goalIcon?: string, 
    cardColor?: string, 
    deadlineDate?: string
  ) => Promise<any>;
}

export function CreateCaixinhaModal({ onCreateCaixinha }: CreateCaixinhaModalProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valorMeta, setValorMeta] = useState("");
  const [goalIcon, setGoalIcon] = useState("piggy-bank");
  const [cardColor, setCardColor] = useState("default");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const valor = parseFloat(valorMeta);
    if (!nome.trim() || isNaN(valor) || valor <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onCreateCaixinha(
        nome.trim(), 
        valor, 
        goalIcon, 
        cardColor, 
        hasDeadline ? deadlineDate : undefined
      );
      setNome("");
      setValorMeta("");
      setGoalIcon("piggy-bank");
      setCardColor("default");
      setHasDeadline(false);
      setDeadlineDate("");
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
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
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

            <IconPicker value={goalIcon} onChange={setGoalIcon} />
            
            <ColorPicker value={cardColor} onChange={setCardColor} />

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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-deadline"
                checked={hasDeadline}
                onCheckedChange={(checked) => setHasDeadline(checked as boolean)}
              />
              <Label htmlFor="has-deadline" className="cursor-pointer">
                Definir data-limite para alcançar a meta
              </Label>
            </div>

            {hasDeadline && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="deadline-date">Data-Limite</Label>
                <Input
                  id="deadline-date"
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required={hasDeadline}
                />
              </div>
            )}
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
