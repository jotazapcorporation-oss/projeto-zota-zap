import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DraggableTabWrapperProps {
  id: string;
  value: string;
  children: ReactNode;
  isActive: boolean;
}

export const DraggableTabWrapper = ({ id, value, children, isActive }: DraggableTabWrapperProps) => {
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
        "relative flex items-center group",
        isDragging && "opacity-50 z-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded transition-opacity",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      <TabsTrigger value={value} className="flex-1 flex items-center justify-center">
        {children}
      </TabsTrigger>
    </div>
  );
};
