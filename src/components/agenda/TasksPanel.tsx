import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Pencil, Trash2, GripVertical, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { TarefaModal } from './TarefaModal';
import { useSupabaseTarefas, Tarefa } from '@/hooks/useSupabaseTarefas';
import { supabase } from '@/integrations/supabase/client';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SortableTaskItemProps {
  tarefa: Tarefa;
  onEdit: (tarefa: Tarefa) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, concluida: boolean) => void;
}

const SortableTaskItem = ({ tarefa, onEdit, onDelete, onToggle }: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500';
      case 'fazer_depois': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const subtarefasConcluidas = tarefa.subtarefas?.filter(st => st.concluida).length || 0;
  const totalSubtarefas = tarefa.subtarefas?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-accent/50 border border-transparent hover:border-border",
        tarefa.concluida && "opacity-60"
      )}
    >
      <Checkbox
        checked={tarefa.concluida}
        onCheckedChange={(checked) => onToggle(tarefa.id, checked as boolean)}
        className="mt-1"
      />

      <div
        className={cn(
          "w-2 h-2 rounded-full mt-2 shrink-0",
          getPrioridadeColor(tarefa.prioridade)
        )}
      />

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm",
          tarefa.concluida && "line-through text-muted-foreground"
        )}>
          {tarefa.titulo}
        </p>
        
        {tarefa.descricao && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {tarefa.descricao}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
          {tarefa.local && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {tarefa.local}
            </span>
          )}
          {tarefa.horario && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {tarefa.horario}
            </span>
          )}
          {totalSubtarefas > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {subtarefasConcluidas}/{totalSubtarefas}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(tarefa)}
          className="h-7 w-7"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(tarefa.id)}
          className="h-7 w-7 hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
        <div
          {...attributes}
          {...listeners}
          className="h-7 w-7 flex items-center justify-center cursor-grab active:cursor-grabbing rounded hover:bg-accent"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export const TasksPanel = () => {
  const [userId, setUserId] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [tarefaParaDeletar, setTarefaParaDeletar] = useState<string | null>(null);
  
  const { tarefas, loading, createTarefa, updateTarefa, deleteTarefa, updateOrdem } = useSupabaseTarefas(userId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tarefas.findIndex((t) => t.id === active.id);
      const newIndex = tarefas.findIndex((t) => t.id === over.id);

      const newTarefas = arrayMove(tarefas, oldIndex, newIndex);
      updateOrdem(newTarefas);
    }
  };

  const handleNovaTarefa = () => {
    setTarefaEditando(null);
    setModalOpen(true);
  };

  const handleEditarTarefa = (tarefa: Tarefa) => {
    setTarefaEditando(tarefa);
    setModalOpen(true);
  };

  const handleSalvarTarefa = async (tarefaData: Partial<Tarefa>) => {
    if (tarefaEditando) {
      await updateTarefa(tarefaEditando.id, tarefaData);
    } else {
      await createTarefa(tarefaData as Omit<Tarefa, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    }
  };

  const handleConfirmarDelete = async () => {
    if (tarefaParaDeletar) {
      await deleteTarefa(tarefaParaDeletar);
      setTarefaParaDeletar(null);
    }
  };

  const handleToggleTarefa = async (id: string, concluida: boolean) => {
    await updateTarefa(id, { concluida });
  };

  return (
    <>
      <Card className="h-full flex flex-col bg-gradient-to-br from-card to-card/50 border shadow-lg">
        <div className="p-4 border-b bg-card/80 backdrop-blur-sm">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Minhas Tarefas
          </h3>
        </div>

        <div className="p-4 border-b">
          <Button
            onClick={handleNovaTarefa}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Tarefa
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Carregando tarefas...
            </div>
          ) : tarefas.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Nenhuma tarefa ainda
              <p className="text-xs mt-2">Clique em "Adicionar Tarefa" para começar! 🎉</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tarefas.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {tarefas.map((tarefa) => (
                    <SortableTaskItem
                      key={tarefa.id}
                      tarefa={tarefa}
                      onEdit={handleEditarTarefa}
                      onDelete={setTarefaParaDeletar}
                      onToggle={handleToggleTarefa}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </Card>

      <TarefaModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setTarefaEditando(null);
        }}
        onSave={handleSalvarTarefa}
        tarefa={tarefaEditando}
      />

      <AlertDialog open={!!tarefaParaDeletar} onOpenChange={(open) => !open && setTarefaParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
