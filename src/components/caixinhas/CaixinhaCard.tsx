import { useState } from "react";
import { toast } from "@/hooks/use-toast";
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
import { TrendingUp, TrendingDown, Trash2, Pencil, AlertTriangle, Clock, Hand } from "lucide-react";
import { Caixinha } from "@/hooks/useSupabaseCaixinhas";
import { formatCurrency } from "@/utils/currency";
import { getIconComponent } from "./IconPicker";
import { getColorClass } from "./ColorPicker";
import { IconPicker } from "./IconPicker";
import { ColorPicker } from "./ColorPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";

interface CaixinhaCardProps {
  caixinha: Caixinha;
  onDepositar: (id: string, valor: number) => Promise<any>;
  onRetirar: (id: string, valor: number) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Caixinha>) => Promise<any>;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function CaixinhaCard({
  caixinha,
  onDepositar,
  onRetirar,
  onDelete,
  onUpdate,
  dragHandleProps,
}: CaixinhaCardProps) {
  const [depositValue, setDepositValue] = useState<number>(0);
  const [withdrawValue, setWithdrawValue] = useState<number>(0);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para edição
  const [editName, setEditName] = useState(caixinha.nome_caixinha);
  const [editIcon, setEditIcon] = useState(caixinha.goal_icon || 'piggy-bank');
  const [editColor, setEditColor] = useState(caixinha.card_color || 'default');
  const [editValorMeta, setEditValorMeta] = useState<number>(caixinha.valor_meta);
  const [editHasDeadline, setEditHasDeadline] = useState(!!caixinha.deadline_date);
  const [editDeadlineDate, setEditDeadlineDate] = useState(caixinha.deadline_date || '');

  const progresso = (caixinha.valor_atual / caixinha.valor_meta) * 100;
  const IconComponent = getIconComponent(caixinha.goal_icon);
  const colorClass = getColorClass(caixinha.card_color);

  // Cálculo de tempo restante e alerta
  const daysRemaining = caixinha.deadline_date 
    ? differenceInDays(parseISO(caixinha.deadline_date), new Date())
    : null;
  
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isNearDeadline = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  // Calcular se está atrasado em relação ao ritmo ideal
  const calculateProgressStatus = () => {
    if (!caixinha.deadline_date) return 'normal';
    
    const totalDays = differenceInDays(
      parseISO(caixinha.deadline_date), 
      parseISO(caixinha.data_criacao)
    );
    const daysPassed = totalDays - (daysRemaining || 0);
    const idealProgress = (daysPassed / totalDays) * 100;
    
    if (progresso < idealProgress - 15) return 'behind';
    if (progresso < idealProgress - 5) return 'warning';
    return 'normal';
  };

  const progressStatus = calculateProgressStatus();

  const getProgressColor = () => {
    if (progressStatus === 'behind') return 'bg-red-500';
    if (progressStatus === 'warning') return 'bg-amber-500';
    return 'bg-primary';
  };

  const handleDeposit = async () => {
    if (depositValue <= 0) return;

    setLoading(true);
    try {
      await onDepositar(caixinha.id, depositValue);
      setDepositValue(0);
      setDepositDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawValue <= 0) return;

    setLoading(true);
    try {
      await onRetirar(caixinha.id, withdrawValue);
      setWithdrawValue(0);
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

  const handleEdit = async () => {
    if (!editName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da caixinha não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    if (editValorMeta <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor da meta deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onUpdate(caixinha.id, {
        nome_caixinha: editName,
        goal_icon: editIcon,
        card_color: editColor,
        valor_meta: editValorMeta,
        deadline_date: editHasDeadline ? editDeadlineDate : null,
      });
      setEditDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("relative hover-lift transition-all h-full flex flex-col", colorClass)}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{caixinha.nome_caixinha}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Meta: {formatCurrency(caixinha.valor_meta)}
              </p>
              {caixinha.deadline_date && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  <span className={cn(
                    "text-xs font-medium",
                    isOverdue && "text-destructive",
                    isNearDeadline && "text-amber-600"
                  )}>
                    {isOverdue 
                      ? `Atrasado ${Math.abs(daysRemaining!)} dias`
                      : daysRemaining === 0
                      ? "Vence hoje!"
                      : `${daysRemaining} dias restantes`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {dragHandleProps && (
              <Button
                variant="secondary"
                size="icon"
                className="cursor-grab active:cursor-grabbing touch-none shadow-sm"
                {...dragHandleProps}
                aria-label="Arrastar para reordenar"
                title="Arrastar para reordenar"
              >
                <Hand className="h-4 w-4" />
              </Button>
            )}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Caixinha</DialogTitle>
                  <DialogDescription>
                    Personalize sua caixinha de poupança
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome">Nome da Caixinha</Label>
                    <Input
                      id="edit-nome"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-valor-meta">Valor da Meta</Label>
                    <CurrencyInput
                      id="edit-valor-meta"
                      value={editValorMeta}
                      onChange={(value) => setEditValorMeta(value)}
                    />
                  </div>

                  <IconPicker value={editIcon} onChange={setEditIcon} />
                  
                  <ColorPicker value={editColor} onChange={setEditColor} />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-has-deadline"
                      checked={editHasDeadline}
                      onCheckedChange={(checked) => setEditHasDeadline(checked as boolean)}
                    />
                    <Label htmlFor="edit-has-deadline" className="cursor-pointer">
                      Definir data-limite
                    </Label>
                  </div>

                  {editHasDeadline && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="edit-deadline-date">Data-Limite</Label>
                      <Input
                        id="edit-deadline-date"
                        type="date"
                        value={editDeadlineDate}
                        onChange={(e) => setEditDeadlineDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEdit} disabled={loading || !editName.trim() || editValorMeta <= 0}>
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        {progressStatus !== 'normal' && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg text-sm",
            progressStatus === 'behind' && "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400",
            progressStatus === 'warning' && "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
          )}>
            <AlertTriangle className="h-4 w-4" />
            <span>
              {progressStatus === 'behind' 
                ? 'Você está atrasado! Aumente os depósitos para atingir a meta no prazo.'
                : 'Atenção: seu progresso está um pouco abaixo do ideal.'
              }
            </span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progresso.toFixed(1)}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={cn("h-full transition-all", getProgressColor())}
              style={{ width: `${Math.min(progresso, 100)}%` }}
            />
          </div>
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
                  <CurrencyInput
                    id="deposit-value"
                    value={depositValue}
                    onChange={(value) => setDepositValue(value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleDeposit} disabled={loading || depositValue <= 0}>
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
                  <CurrencyInput
                    id="withdraw-value"
                    value={withdrawValue}
                    onChange={(value) => setWithdrawValue(value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleWithdraw} disabled={loading || withdrawValue <= 0}>
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
