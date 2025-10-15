import { Card as CardType } from '@/hooks/useSupabaseBoards';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckCircle2, Tag, GripVertical, Clock, AlertCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EnhancedKanbanCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
}

export const EnhancedKanbanCard = ({ card, onEdit }: EnhancedKanbanCardProps) => {
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
  };

  const checklistConcluidos = card.checklist?.filter(i => i.concluido).length || 0;
  const checklistTotal = card.checklist?.length || 0;
  const progress = checklistTotal > 0 ? (checklistConcluidos / checklistTotal) * 100 : 0;

  // Date utilities
  const getDateStatus = () => {
    if (!card.data_vencimento) return null;
    
    const date = new Date(card.data_vencimento);
    if (isPast(date) && !isToday(date)) {
      return { label: 'Atrasado', variant: 'destructive' as const, urgent: true };
    }
    if (isToday(date)) {
      return { label: 'Hoje', variant: 'default' as const, urgent: true };
    }
    if (isTomorrow(date)) {
      return { label: 'Amanhã', variant: 'secondary' as const, urgent: false };
    }
    return { label: format(date, "dd MMM", { locale: ptBR }), variant: 'outline' as const, urgent: false };
  };

  const dateStatus = getDateStatus();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1
      }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onEdit(card)}
      className={cn(
        "group relative bg-card rounded-xl border-2 shadow-sm p-4 cursor-pointer transition-all",
        "hover:shadow-lg hover:border-primary/50",
        isDragging && "shadow-2xl ring-2 ring-primary/50 border-primary",
        dateStatus?.urgent && "border-l-4 border-l-destructive"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 hover:bg-accent rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-3 pr-8">
        {/* Title */}
        <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
          {card.titulo}
        </h4>

        {/* Description */}
        {card.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {card.descricao}
          </p>
        )}

        {/* Labels */}
        {card.etiquetas && card.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.etiquetas.map((etiqueta) => (
              <motion.div
                key={etiqueta.id}
                whileHover={{ scale: 1.05 }}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium text-white shadow-sm"
                style={{ backgroundColor: etiqueta.cor }}
              >
                {etiqueta.texto}
              </motion.div>
            ))}
          </div>
        )}

        {/* Checklist Progress */}
        {checklistTotal > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className={cn(
                  "h-3.5 w-3.5",
                  progress === 100 ? "text-green-500" : "text-muted-foreground"
                )} />
                Checklist
              </span>
              <span className={cn(
                "font-medium",
                progress === 100 ? "text-green-500" : "text-foreground"
              )}>
                {checklistConcluidos}/{checklistTotal}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center gap-2 flex-wrap">
          {dateStatus && (
            <Badge variant={dateStatus.variant} className="gap-1 text-[10px] py-0.5">
              {dateStatus.urgent && <Clock className="h-3 w-3" />}
              {dateStatus.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Completion Animation Trigger */}
      {progress === 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4" />
        </motion.div>
      )}
    </motion.div>
  );
};
