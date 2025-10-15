import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableFormFieldProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const DraggableFormField = ({ id, children, className }: DraggableFormFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50",
        className
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 h-full flex items-start pt-8 -ml-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Arrastar para reordenar campo"
      >
        <div className="p-1.5 hover:bg-accent rounded-lg">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Field Content */}
      <div className={cn(
        "transition-all",
        isDragging && "ring-2 ring-primary rounded-lg"
      )}>
        {children}
      </div>
    </div>
  );
};
