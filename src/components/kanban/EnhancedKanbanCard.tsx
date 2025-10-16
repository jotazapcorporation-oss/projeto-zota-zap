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
        "group relative bg-card rounded-xl border-2 shadow-sm overflow-hidden cursor-pointer transition-all",
        "hover:shadow-lg hover:border-primary/50",
        isDragging && "shadow-2xl ring-2 ring-primary/50 border-primary",
        dateStatus?.urgent && "border-l-4 border-l-destructive"
      )}
    >
      {/* Cover Image */}
      {card.cover_image && (
        <div className="w-full h-32 bg-muted relative overflow-hidden">
          <img 
            src={card.cover_image} 
            alt="Card cover" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 hover:bg-accent rounded-lg bg-background/80 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-3 p-4">
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
          <div className="flex flex-wrap gap-2">
            {card.etiquetas.map((etiqueta) => (
              <motion.div
                key={etiqueta.id}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-md"
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

      {/* Completion Badge - Green Checkmark */}
      {checklistTotal > 0 && progress === 100 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: [0, 1.3, 1], rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2 shadow-lg border-4 border-background z-10"
        >
          <CheckCircle2 className="h-5 w-5" />
        </motion.div>
      )}
    </motion.div>
  );
};
