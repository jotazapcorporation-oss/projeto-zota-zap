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
      const deltaY = e.clientY - startY.current;
      const newHeight = Math.max(60, startHeight.current + deltaY);
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      
      if (height !== null && eventRef.current) {
        // Calculate new duration based on height (30min increments)
        // Assuming 60px = 1 hour
        const hours = Math.round(height / 60);
        const minutes = Math.round((height % 60) / 60 * 60);
        
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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
        isResizing && "cursor-ns-resize",
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
      
      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2",
          "cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-primary-foreground/20 hover:bg-primary-foreground/40",
          "flex items-center justify-center"
        )}
      >
        <div className="w-8 h-1 bg-primary-foreground/60 rounded-full" />
      </div>
    </div>
  );
};
