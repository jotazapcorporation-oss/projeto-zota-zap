import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useLocalAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity,
  CalendarIcon,
  ArrowUpCircle,
  ArrowDownCircle 
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { TutorialButton } from "@/components/ui/tutorial-button";
import { TutorialModal } from "@/components/ui/tutorial-modal";
import { useTutorial } from "@/hooks/useTutorial";
import { TransactionDetailModal } from "@/components/transactions/TransactionDetailModal";

interface Transacao {
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
  };
}

type PeriodFilter = "esta-semana" | "este-mes" | "mes-anterior" | "customizado";

export default function TermometroGastos() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("este-mes");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<Transacao | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const tutorial = useTutorial('termometro');

  useEffect(() => {
    if (user) {
      fetchTransacoes();
    }
  }, [user]);

  const fetchTransacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transacoes")
        .select(`
          *,
          categorias!fk_transacoes_categoria (
            id,
            nome,
            tipo
          )
        `)
        .eq("userid", user?.id as string)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransacoes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular período de filtro
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    
    switch (periodFilter) {
      case "esta-semana":
        return {
          start: startOfWeek(now, { locale: ptBR }),
          end: endOfWeek(now, { locale: ptBR }),
        };
      case "este-mes":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "mes-anterior":
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      case "customizado":
        if (dateRange?.from && dateRange?.to) {
          return {
            start: dateRange.from,
            end: dateRange.to,
          };
        }
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
    }
  };

  // Filtrar transações por período
  const filteredTransacoes = useMemo(() => {
    const { start, end } = getDateRange();
    
    return transacoes.filter((t) => {
      const transactionDate = new Date(t.quando || t.created_at);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transacoes, periodFilter, dateRange]);

  // Calcular totais e análises detalhadas
  const { receitas, despesas, saldo, termometro, analiseDetalhada } = useMemo(() => {
    const receitasTransacoes = filteredTransacoes.filter((t) => t.tipo === "receita");
    const despesasTransacoes = filteredTransacoes.filter((t) => t.tipo === "despesa");

    const receitas = receitasTransacoes.reduce((acc, t) => acc + (t.valor || 0), 0);
    const despesas = despesasTransacoes.reduce((acc, t) => acc + (t.valor || 0), 0);
    const saldo = receitas - despesas;
    const termometro = receitas > 0 ? (despesas / receitas) * 100 : 0;

    // Análise por dia
    const receitasPorDia = new Map<string, number>();
    const despesasPorDia = new Map<string, number>();

    filteredTransacoes.forEach((t) => {
      const dia = format(new Date(t.quando || t.created_at), "yyyy-MM-dd");
      if (t.tipo === "receita") {
        receitasPorDia.set(dia, (receitasPorDia.get(dia) || 0) + (t.valor || 0));
      } else {
        despesasPorDia.set(dia, (despesasPorDia.get(dia) || 0) + (t.valor || 0));
      }
    });

    // Dia com maior receita
    let diaMaiorReceita = { dia: "", valor: 0 };
    receitasPorDia.forEach((valor, dia) => {
      if (valor > diaMaiorReceita.valor) {
        diaMaiorReceita = { dia, valor };
      }
    });

    // Dia com maior gasto
    let diaMaiorGasto = { dia: "", valor: 0 };
    despesasPorDia.forEach((valor, dia) => {
      if (valor > diaMaiorGasto.valor) {
        diaMaiorGasto = { dia, valor };
      }
    });

    // Categoria campeã de receita
    const receitasPorCategoria = new Map<string, { nome: string; valor: number }>();
    receitasTransacoes.forEach((t) => {
      const catNome = t.categorias?.nome || "Sem categoria";
      const atual = receitasPorCategoria.get(catNome) || { nome: catNome, valor: 0 };
      receitasPorCategoria.set(catNome, {
        nome: catNome,
        valor: atual.valor + (t.valor || 0),
      });
    });

    let categoriaCampeaReceita = { nome: "Nenhuma", valor: 0 };
    receitasPorCategoria.forEach((cat) => {
      if (cat.valor > categoriaCampeaReceita.valor) {
        categoriaCampeaReceita = cat;
      }
    });

    // Categoria de maior gasto
    const despesasPorCategoria = new Map<string, { nome: string; valor: number }>();
    despesasTransacoes.forEach((t) => {
      const catNome = t.categorias?.nome || "Sem categoria";
      const atual = despesasPorCategoria.get(catNome) || { nome: catNome, valor: 0 };
      despesasPorCategoria.set(catNome, {
        nome: catNome,
        valor: atual.valor + (t.valor || 0),
      });
    });

    let categoriaMaiorGasto = { nome: "Nenhuma", valor: 0 };
    despesasPorCategoria.forEach((cat) => {
      if (cat.valor > categoriaMaiorGasto.valor) {
        categoriaMaiorGasto = cat;
      }
    });

    return {
      receitas,
      despesas,
      saldo,
      termometro,
      analiseDetalhada: {
        diaMaiorReceita,
        diaMaiorGasto,
        categoriaCampeaReceita,
        categoriaMaiorGasto,
      },
    };
  }, [filteredTransacoes]);

  // Determinar status do termômetro
  const getTermometroStatus = () => {
    if (termometro <= 50) return { color: "text-green-600", bg: "bg-green-100", label: "Excelente" };
    if (termometro <= 80) return { color: "text-amber-600", bg: "bg-amber-100", label: "Atenção" };
    return { color: "text-red-600", bg: "bg-red-100", label: "Crítico" };
  };

  const termometroStatus = getTermometroStatus();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handlePeriodChange = (period: PeriodFilter) => {
    setPeriodFilter(period);
    if (period !== "customizado") {
      setDateRange(undefined);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Termômetro de Gastos
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise completa da sua saúde financeira
          </p>
        </div>
        <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={periodFilter === "esta-semana" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("esta-semana")}
            >
              Esta Semana
            </Button>
            <Button
              variant={periodFilter === "este-mes" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("este-mes")}
            >
              Este Mês
            </Button>
            <Button
              variant={periodFilter === "mes-anterior" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("mes-anterior")}
            >
              Mês Anterior
            </Button>

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={periodFilter === "customizado" ? "default" : "outline"}
                  size="sm"
                  className={cn("justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Período Customizado</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    setPeriodFilter("customizado");
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Saldo Atual */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(saldo)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Período selecionado
            </p>
          </CardContent>
        </Card>

        {/* Entradas */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(receitas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de receitas
            </p>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(despesas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de despesas
            </p>
          </CardContent>
        </Card>

        {/* Termômetro de Gastos */}
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Termômetro</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${termometroStatus.color}`}>
                {termometro.toFixed(0)}%
              </div>
              <Badge variant="outline" className={cn(termometroStatus.bg, termometroStatus.color)}>
                {termometroStatus.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gastos vs Receitas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transações do Período</span>
            <Badge variant="outline">{filteredTransacoes.length} transações</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : filteredTransacoes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma transação encontrada no período selecionado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransacoes.map((transacao) => (
                <div
                  key={transacao.id}
                  onClick={() => {
                    setSelectedTransaction(transacao);
                    setDetailModalOpen(true);
                  }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-full",
                      transacao.tipo === "receita" ? "bg-green-100" : "bg-red-100"
                    )}>
                      {transacao.tipo === "receita" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {transacao.categorias?.nome || "Sem categoria"}
                        </p>
                        {transacao.estabelecimento && (
                          <span className="text-sm text-muted-foreground">
                            • {transacao.estabelecimento}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transacao.quando || transacao.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "text-lg font-bold",
                    transacao.tipo === "receita" ? "text-green-600" : "text-red-600"
                  )}>
                    {transacao.tipo === "receita" ? "+" : "-"}
                    {formatCurrency(Math.abs(transacao.valor || 0))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise Detalhada Expandida */}
      {filteredTransacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Análise Detalhada
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Insights aprofundados sobre suas finanças no período
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Resumo Geral */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total de Gastos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(despesas)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total de Entradas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(receitas)}
                  </p>
                </div>
              </div>

              {/* Análise de Dias */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-accent/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">Dia com Maior Receita</p>
                  </div>
                  {analiseDetalhada.diaMaiorReceita.valor > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(analiseDetalhada.diaMaiorReceita.dia), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(analiseDetalhada.diaMaiorReceita.valor)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem receitas no período</p>
                  )}
                </div>

                <div className="p-4 bg-accent/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium">Dia com Maior Gasto</p>
                  </div>
                  {analiseDetalhada.diaMaiorGasto.valor > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(analiseDetalhada.diaMaiorGasto.dia), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(analiseDetalhada.diaMaiorGasto.valor)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem despesas no período</p>
                  )}
                </div>
              </div>

              {/* Análise de Categorias */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">Categoria Campeã (Receita)</p>
                  </div>
                  {analiseDetalhada.categoriaCampeaReceita.valor > 0 ? (
                    <>
                      <p className="text-base font-medium mb-1">
                        {analiseDetalhada.categoriaCampeaReceita.nome}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(analiseDetalhada.categoriaCampeaReceita.valor)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem receitas no período</p>
                  )}
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium">Categoria de Maior Gasto</p>
                  </div>
                  {analiseDetalhada.categoriaMaiorGasto.valor > 0 ? (
                    <>
                      <p className="text-base font-medium mb-1">
                        {analiseDetalhada.categoriaMaiorGasto.nome}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(analiseDetalhada.categoriaMaiorGasto.valor)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem despesas no período</p>
                  )}
                </div>
              </div>

              {/* Alerta */}
              {termometro > 80 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-400">
                    <strong>⚠️ Atenção:</strong> Seus gastos estão acima de 80% das suas receitas. 
                    Considere revisar suas despesas para melhorar sua saúde financeira.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <TutorialModal
        isOpen={tutorial.isOpen}
        onClose={() => tutorial.setIsOpen(false)}
        sectionId="termometro"
        progress={tutorial.progress}
        onToggleStep={tutorial.toggleStep}
        onReset={tutorial.resetProgress}
      />

      <TransactionDetailModal
        transaction={selectedTransaction}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
