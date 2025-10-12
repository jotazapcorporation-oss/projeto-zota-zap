import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PiggyBank, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Caixinha } from "@/hooks/useSupabaseCaixinhas";
import { formatCurrency } from "@/utils/currency";

interface CaixinhaCardProps {
  caixinha: Caixinha;
  onDepositar: (id: string, valor: number) => Promise<any>;
  onRetirar: (id: string, valor: number) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export function CaixinhaCard({
  caixinha,
  onDepositar,
  onRetirar,
  onDelete,
}: CaixinhaCardProps) {
  const [depositValue, setDepositValue] = useState("");
  const [withdrawValue, setWithdrawValue] = useState("");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const progresso = (caixinha.valor_atual / caixinha.valor_meta) * 100;

  const handleDeposit = async () => {
    const valor = parseFloat(depositValue);
    if (isNaN(valor) || valor <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onDepositar(caixinha.id, valor);
      setDepositValue("");
      setDepositDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const valor = parseFloat(withdrawValue);
    if (isNaN(valor) || valor <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onRetirar(caixinha.id, valor);
      setWithdrawValue("");
      setWithdrawDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(caixinha.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{caixinha.nome_caixinha}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Meta: {formatCurrency(caixinha.valor_meta)}
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir caixinha?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O valor atual será perdido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progresso.toFixed(1)}%</span>
          </div>
          <Progress value={progresso} className="h-3" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor Atual:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(caixinha.valor_atual)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Faltam:</span>
            <span className="text-lg font-semibold">
              {formatCurrency(caixinha.valor_meta - caixinha.valor_atual)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="default">
                <TrendingUp className="mr-2 h-4 w-4" />
                Depositar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Depositar na Caixinha</DialogTitle>
                <DialogDescription>
                  Digite o valor que deseja depositar em "{caixinha.nome_caixinha}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-value">Valor</Label>
                  <Input
                    id="deposit-value"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={depositValue}
                    onChange={(e) => setDepositValue(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleDeposit} disabled={loading || !depositValue}>
                  {loading ? "Depositando..." : "Confirmar Depósito"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <TrendingDown className="mr-2 h-4 w-4" />
                Retirar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retirar da Caixinha</DialogTitle>
                <DialogDescription>
                  Digite o valor que deseja retirar de "{caixinha.nome_caixinha}". Disponível:{" "}
                  {formatCurrency(caixinha.valor_atual)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-value">Valor</Label>
                  <Input
                    id="withdraw-value"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={caixinha.valor_atual}
                    placeholder="0.00"
                    value={withdrawValue}
                    onChange={(e) => setWithdrawValue(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleWithdraw} disabled={loading || !withdrawValue}>
                  {loading ? "Retirando..." : "Confirmar Retirada"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
