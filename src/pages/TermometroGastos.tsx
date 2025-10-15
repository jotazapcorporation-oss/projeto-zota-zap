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
          categorias (
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

  // Calcular totais
  const { receitas, despesas, saldo, termometro } = useMemo(() => {
    const receitas = filteredTransacoes
      .filter((t) => t.tipo === "receita")
      .reduce((acc, t) => acc + (t.valor || 0), 0);

    const despesas = filteredTransacoes
      .filter((t) => t.tipo === "despesa")
      .reduce((acc, t) => acc + (t.valor || 0), 0);

    const saldo = receitas - despesas;

    // Calcular termômetro (percentual de gastos em relação às receitas)
    const termometro = receitas > 0 ? (despesas / receitas) * 100 : 0;

    return { receitas, despesas, saldo, termometro };
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
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

      {/* Análise de Gastos */}
      {filteredTransacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análise Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total de Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(despesas)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total de Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(receitas)}
                </p>
              </div>
            </div>
            
            {termometro > 80 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400">
                  <strong>⚠️ Atenção:</strong> Seus gastos estão acima de 80% das suas receitas. 
                  Considere revisar suas despesas para melhorar sua saúde financeira.
                </p>
              </div>
            )}
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
    </div>
  );
}
