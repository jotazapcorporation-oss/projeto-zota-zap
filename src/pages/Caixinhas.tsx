import { Card, CardContent } from "@/components/ui/card";
import { Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { useSupabaseCaixinhas } from "@/hooks/useSupabaseCaixinhas";
import { CaixinhaCard } from "@/components/caixinhas/CaixinhaCard";
import { CreateCaixinhaModal } from "@/components/caixinhas/CreateCaixinhaModal";
import { formatCurrency } from "@/utils/currency";

export default function Caixinhas() {
  const {
    caixinhas,
    loading,
    saldoGeral,
    createCaixinha,
    depositar,
    retirar,
    deleteCaixinha,
  } = useSupabaseCaixinhas();

  const totalPoupado = caixinhas.reduce((acc, c) => acc + c.valor_atual, 0);
  const totalMetas = caixinhas.reduce((acc, c) => acc + c.valor_meta, 0);
  const progressoGeral = totalMetas > 0 ? (totalPoupado / totalMetas) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <PiggyBank className="h-8 w-8 text-primary" />
            Caixinhas de Poupança
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize suas economias e alcance suas metas financeiras
          </p>
        </div>
        <CreateCaixinhaModal onCreateCaixinha={createCaixinha} />
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Disponível</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(saldoGeral)}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Poupado</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalPoupado)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progresso Geral</p>
                <p className="text-2xl font-bold mt-1">
                  {progressoGeral.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <PiggyBank className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Caixinhas */}
      {caixinhas.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <PiggyBank className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Nenhuma caixinha criada</h3>
              <p className="text-muted-foreground mt-2">
                Comece criando sua primeira caixinha de poupança para organizar suas economias!
              </p>
            </div>
            <CreateCaixinhaModal onCreateCaixinha={createCaixinha} />
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caixinhas.map((caixinha) => (
            <CaixinhaCard
              key={caixinha.id}
              caixinha={caixinha}
              onDepositar={depositar}
              onRetirar={retirar}
              onDelete={deleteCaixinha}
            />
          ))}
        </div>
      )}
    </div>
  );
}
