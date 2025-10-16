import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useMemo } from 'react';

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

  // 60px = 1h (row height)
  const rowHeight = 60;

  // Height from stored end_time (fallback to 60px)
  const baseHeight = useMemo(() => {
    if (!event.end_time) return rowHeight;
    try {
      const [sh, sm] = event.event_time.split(':').map(Number);
      const [eh, em] = event.end_time.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      let duration = end - start;
      if (duration <= 0) duration += 24 * 60; // handle crossing midnight
      return Math.max(rowHeight / 2, (duration / 60) * rowHeight);
    } catch {
      return rowHeight;
    }
  }, [event.event_time, event.end_time]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = eventRef.current?.offsetHeight || baseHeight;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const deltaY = e.clientY - startY.current;
      const newHeight = Math.max(rowHeight / 2, startHeight.current + deltaY);
      // snap to 30-minute increments
      const snap = rowHeight / 2; // 30min
      const snapped = Math.round(newHeight / snap) * snap;
      setHeight(snapped);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(false);

      const finalHeight = height ?? baseHeight; // px
      const totalMinutes = Math.max(30, Math.round((finalHeight / rowHeight) * 60 / 30) * 30);

      const [startHour, startMinute] = event.event_time.split(':').map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = startTotalMinutes + totalMinutes;
      const endHour = Math.floor(endTotalMinutes / 60) % 24;
      const endMinute = endTotalMinutes % 60;
      const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute
        .toString()
        .padStart(2, '0')}`;

      onResize(event.event_id, newEndTime);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: false, capture: true });

    // Prevent text selection and show resize cursor
    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true } as any);
      document.removeEventListener('mouseup', handleMouseUp, { capture: true } as any);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [isResizing, height, baseHeight, event, onResize]);

  return (
    <div
      ref={eventRef}
      onClick={(e) => {
        e.stopPropagation();
        if (!isResizing) onEventClick(event);
      }}
      style={{ height: `${height ?? baseHeight}px` }}
      className={cn(
        // Absolutely position by default so it doesn't affect grid heights
        'absolute left-1 right-1 top-1',
        'relative group',
        compact ? 'p-2' : 'p-3',
        'rounded-lg cursor-pointer',
        'bg-primary text-primary-foreground',
        'hover:opacity-90 transition-opacity shadow-md',
        'border-l-4 border-primary-foreground/30',
        'select-none',
        isResizing && 'cursor-ns-resize select-none',
        className
      )}
    >
      <div className="text-xs font-medium opacity-90">
        {event.event_time}
        {event.end_time ? ` - ${event.end_time}` : ''}
      </div>
      <div className="font-semibold truncate">{event.titulo}</div>
      {!compact && event.local && (
        <div className="text-sm opacity-90 mt-1 truncate">📍 {event.local}</div>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-3',
          'cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity',
          'bg-primary-foreground/20 hover:bg-primary-foreground/40',
          'flex items-center justify-center',
          'z-10'
        )}
      >
        <div className="w-12 h-1 bg-primary-foreground/80 rounded-full" />
      </div>
    </div>
  );
};