import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currency";
import { Calendar, Clock, Tag, FileText, Store } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: number;
  created_at: string;
  quando: string | null;
  estabelecimento: string | null;
  valor: number | null;
  detalhes: string | null;
  tipo: string | null;
  category_id: string;
  categorias?: {
    id: string;
    nome: string;
    tipo: string;
    icon?: string;
    color?: string;
  };
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const transactionDate = new Date(transaction.quando || transaction.created_at);
  const isReceita = transaction.tipo === "receita";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Transação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Valor */}
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Valor</p>
            <p className={`text-4xl font-bold ${isReceita ? "text-green-600" : "text-red-600"}`}>
              {isReceita ? "+" : "-"}
              {formatCurrency(Math.abs(transaction.valor || 0))}
            </p>
          </div>

          <Separator />

          {/* Categoria */}
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Categoria</p>
              <div className="flex items-center gap-2">
                {transaction.categorias?.icon && (
                  <span className="text-xl">{transaction.categorias.icon}</span>
                )}
                <Badge 
                  variant="outline" 
                  className="text-base"
                  style={{ 
                    borderColor: transaction.categorias?.color || '#6366F1',
                    color: transaction.categorias?.color || '#6366F1'
                  }}
                >
                  {transaction.categorias?.nome || "Sem categoria"}
                </Badge>
                <Badge variant={isReceita ? "default" : "destructive"}>
                  {isReceita ? "Receita" : "Despesa"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Data</p>
              <p className="text-base">
                {format(transactionDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Hora */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Hora</p>
              <p className="text-base">
                {format(transactionDate, "HH:mm:ss", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Estabelecimento */}
          {transaction.estabelecimento && (
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Estabelecimento</p>
                <p className="text-base">{transaction.estabelecimento}</p>
              </div>
            </div>
          )}

          {/* Detalhes/Descrição */}
          {transaction.detalhes && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md">
                  {transaction.detalhes}
                </p>
              </div>
            </>
          )}

          {/* ID da Transação */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              ID da Transação: #{transaction.id}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
