import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface ResizableEventProps {
  event: AgendaEvent;
  onEventClick: (event: AgendaEvent) => void;
  onResize: (eventId: string, newEndTime: string) => void;
  className?: string;
  compact?: boolean;
}

export const ResizableEvent = ({
  event,
  onEventClick,
  onResize,
  className,
  compact = false,
}: ResizableEventProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const eventRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = eventRef.current?.offsetHeight || 0;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Previne qualquer comportamento padrão e propagação
      e.preventDefault();
      e.stopPropagation();
      
      const deltaY = e.clientY - startY.current;
      const newHeight = Math.max(60, startHeight.current + deltaY);
      setHeight(newHeight);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(false);
      
      if (height !== null && eventRef.current) {
        // Calculate new duration based on height (30min increments)
        // Assuming 60px = 1 hour
        const hours = Math.floor(height / 60);
        const minutes = (height % 60);
        
        // Round to nearest 30 min
        const roundedMinutes = Math.round(minutes / 30) * 30;
        const totalMinutes = hours * 60 + roundedMinutes;
        
        // Parse start time
        const [startHour, startMinute] = event.event_time.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;
        
        // Calculate end time
        const endTotalMinutes = Math.max(startTotalMinutes + 30, startTotalMinutes + totalMinutes);
        const endHour = Math.floor(endTotalMinutes / 60) % 24;
        const endMinute = endTotalMinutes % 60;
        
        const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        onResize(event.id, newEndTime);
        setHeight(null);
      }
    };

    // Adiciona listeners ao document para garantir que funcione em toda a tela
    document.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: false, capture: true });

    // Previne seleção de texto durante o arraste
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, height, event, onResize]);

  return (
    <div
      ref={eventRef}
      onClick={(e) => {
        e.stopPropagation();
        if (!isResizing) onEventClick(event);
      }}
      style={height !== null ? { height: `${height}px` } : undefined}
      className={cn(
        "relative group",
        compact ? "p-2" : "p-3",
        "rounded-lg cursor-pointer",
        "bg-primary text-primary-foreground",
        "hover:opacity-90 transition-opacity shadow-md",
        "border-l-4 border-primary-foreground/30",
        // Importante: não permitir que o evento se mova, apenas redimensione
        "select-none",
        isResizing && "cursor-ns-resize select-none",
        className
      )}
    >
      <div className="font-semibold truncate">{event.titulo}</div>
      {!compact && (
        <>
          <div className="text-sm opacity-90 mt-1">
            ⏰ {event.event_time}
          </div>
          {event.local && (
            <div className="text-sm opacity-90 mt-1 truncate">
              📍 {event.local}
            </div>
          )}
        </>
      )}
      
      {/* Resize Handle - Alça de redimensionamento */}
      <div
        onMouseDown={handleResizeStart}
        className={cn(
          "absolute bottom-0 left-0 right-0 h-3",
          "cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-primary-foreground/20 hover:bg-primary-foreground/40",
          "flex items-center justify-center",
          // Garante que o handle fique acima de outros elementos
          "z-10"
        )}
      >
        <div className="w-12 h-1 bg-primary-foreground/80 rounded-full" />
      </div>
    </div>
  );
};
