import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, PiggyBank, TrendingUp, ArrowUpDown } from "lucide-react";
import { useSupabaseCaixinhas } from "@/hooks/useSupabaseCaixinhas";
import { CaixinhaCard } from "@/components/caixinhas/CaixinhaCard";
import { CreateCaixinhaModal } from "@/components/caixinhas/CreateCaixinhaModal";
import { formatCurrency } from "@/utils/currency";
import { TutorialButton } from "@/components/ui/tutorial-button";
import { TutorialModal } from "@/components/ui/tutorial-modal";
import { useTutorial } from "@/hooks/useTutorial";
import { DEFAULT_TEMPLATES } from "@/components/caixinhas/DefaultTemplates";
import { toast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Caixinha } from "@/hooks/useSupabaseCaixinhas";

type SortOption = 'manual' | 'meta' | 'progresso' | 'prazo';

function SortableCaixinhaCard({ caixinha, ...props }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: caixinha.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CaixinhaCard 
        caixinha={caixinha} 
        dragHandleProps={{ ...attributes, ...listeners }}
        {...props} 
      />
    </div>
  );
}

export default function Caixinhas() {
  const {
    caixinhas,
    loading,
    saldoGeral,
    createCaixinha,
    depositar,
    retirar,
    deleteCaixinha,
    updateCaixinha,
    reorderCaixinhas,
    setCaixinhas,
  } = useSupabaseCaixinhas();

  const [sortBy, setSortBy] = useState<SortOption>('manual');
  const [templatesCreated, setTemplatesCreated] = useState(false);
  const tutorial = useTutorial('caixinhas');

  // Criar templates padrão no primeiro acesso
  useEffect(() => {
    const hasCreatedTemplates = localStorage.getItem('caixinhas_templates_created');
    
    if (!loading && caixinhas.length === 0 && !hasCreatedTemplates && !templatesCreated) {
      createDefaultTemplates();
    }
  }, [loading, caixinhas.length]);

  const createDefaultTemplates = async () => {
    setTemplatesCreated(true);
    
    try {
      for (const template of DEFAULT_TEMPLATES) {
        await createCaixinha(
          template.nome,
          template.valorMetaSugerido,
          template.icon,
          template.color
        );
      }
      
      localStorage.setItem('caixinhas_templates_created', 'true');
      
      toast({
        title: "Metas criadas!",
        description: "Criamos 4 metas iniciais para você começar. Personalize como quiser!",
      });
    } catch (error) {
      console.error("Erro ao criar templates:", error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Reordenar com base na lista visível para evitar "pular" posições
    const oldIndex = sortedCaixinhas.findIndex((c) => c.id === active.id);
    const newIndex = sortedCaixinhas.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(sortedCaixinhas, oldIndex, newIndex);
    reorderCaixinhas(reordered);
  };

  const sortedCaixinhas = useMemo(() => {
    if (sortBy === 'manual') return caixinhas;

    const sorted = [...caixinhas].sort((a, b) => {
      switch (sortBy) {
        case 'meta':
          return b.valor_meta - a.valor_meta;
        case 'progresso':
          const progressoA = (a.valor_atual / a.valor_meta) * 100;
          const progressoB = (b.valor_atual / b.valor_meta) * 100;
          return progressoB - progressoA;
        case 'prazo':
          if (!a.deadline_date && !b.deadline_date) return 0;
          if (!a.deadline_date) return 1;
          if (!b.deadline_date) return -1;
          return new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [caixinhas, sortBy]);

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
        <div className="flex gap-2">
          <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
          <CreateCaixinhaModal onCreateCaixinha={createCaixinha} />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover-impulse">
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

        <Card className="hover-impulse">
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

        <Card className="hover-impulse">
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

      {/* Controles de Ordenação */}
      {caixinhas.length > 0 && (
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Ordem Manual (Arrastar)</SelectItem>
              <SelectItem value="meta">Valor da Meta</SelectItem>
              <SelectItem value="progresso">Progresso (%)</SelectItem>
              <SelectItem value="prazo">Data-Limite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
      ) : sortBy === 'manual' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCaixinhas.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedCaixinhas.map((caixinha) => (
                <SortableCaixinhaCard
                  key={caixinha.id}
                  caixinha={caixinha}
                  onDepositar={depositar}
                  onRetirar={retirar}
                  onDelete={deleteCaixinha}
                  onUpdate={updateCaixinha}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCaixinhas.map((caixinha) => (
            <CaixinhaCard
              key={caixinha.id}
              caixinha={caixinha}
              onDepositar={depositar}
              onRetirar={retirar}
              onDelete={deleteCaixinha}
              onUpdate={updateCaixinha}
            />
          ))}
        </div>
      )}

      <TutorialModal
        isOpen={tutorial.isOpen}
        onClose={() => tutorial.setIsOpen(false)}
        sectionId="caixinhas"
        progress={tutorial.progress}
        onToggleStep={tutorial.toggleStep}
        onReset={tutorial.resetProgress}
      />
    </div>
  );
}
