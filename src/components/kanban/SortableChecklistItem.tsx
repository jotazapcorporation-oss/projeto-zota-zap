import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { ChecklistItem } from '@/hooks/useSupabaseBoards';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SortableChecklistItemProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export const SortableChecklistItem = ({ item, onToggle, onRemove }: SortableChecklistItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg bg-accent/50 relative",
        isDragging && "opacity-50 z-50 ring-2 ring-primary"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox checked={item.concluido} onCheckedChange={() => onToggle(item.id)} />
      <span className={cn("flex-1 text-sm", item.concluido && "line-through text-muted-foreground")}>
        {item.texto}
      </span>
      <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)} className="h-7 w-7 hover:text-destructive">
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};
