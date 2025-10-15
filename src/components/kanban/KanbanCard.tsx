import { Card } from '@/hooks/useSupabaseBoards';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckCircle2, Tag, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  card: Card;
  onEdit: (card: Card) => void;
}

export const KanbanCard = ({ card, onEdit }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const checklistConcluidos = card.checklist?.filter(i => i.concluido).length || 0;
  const checklistTotal = card.checklist?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onEdit(card)}
      className={cn(
        "group bg-card rounded-lg border shadow-sm p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <h4 className="font-medium text-sm leading-tight">
            {card.titulo}
          </h4>

          {card.descricao && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {card.descricao}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {card.etiquetas?.map((etiqueta) => (
              <div
                key={etiqueta.id}
                className="px-2 py-0.5 rounded text-[10px] font-medium text-white"
                style={{ backgroundColor: etiqueta.cor }}
              >
                {etiqueta.texto}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {card.data_vencimento && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(card.data_vencimento), "dd/MM", { locale: ptBR })}
              </div>
            )}

            {checklistTotal > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className={cn(
                  "h-3 w-3",
                  checklistConcluidos === checklistTotal && "text-green-500"
                )} />
                {checklistConcluidos}/{checklistTotal}
              </div>
            )}

            {card.etiquetas && card.etiquetas.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {card.etiquetas.length}
              </div>
            )}
          </div>
        </div>

        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
