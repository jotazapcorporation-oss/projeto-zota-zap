import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ResizableEvent } from './ResizableEvent';

interface CalendarDayViewProps {
  events: AgendaEvent[];
  selectedDate: Date;
  onTimeSlotClick: (time: string) => void;
  onEventClick: (event: AgendaEvent) => void;
  onEventResize?: (eventId: string, newEndTime: string) => void;
}

export const CalendarDayView = ({
  events,
  selectedDate,
  onTimeSlotClick,
  onEventClick,
  onEventResize,
}: CalendarDayViewProps) => {
  
  const handleResize = async (eventId: string, newEndTime: string) => {
    if (!onEventResize) return;
    await onEventResize(eventId, newEndTime);
  };
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      if (!isSameDay(parseISO(event.event_date), selectedDate)) return false;
      
      const eventHour = parseInt(event.event_time.split(':')[0]);
      return eventHour === hour;
    });
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border shadow-lg overflow-hidden">
      {/* Header */}
      <div className={cn(
        "p-4 border-b bg-card sticky top-0 z-10",
        isToday && "bg-primary/10"
      )}>
        <div className="text-center">
          <div className="text-sm uppercase text-muted-foreground font-medium">
            {format(selectedDate, 'EEEE', { locale: ptBR })}
          </div>
          <div className={cn(
            "text-4xl font-bold mt-1",
            isToday && "text-primary"
          )}>
            {format(selectedDate, 'd')}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* Grid de horários */}
      <div className="flex-1 overflow-auto">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          
          return (
            <div
              key={hour}
              onClick={() => onTimeSlotClick(timeString)}
              className={cn(
                "flex border-b min-h-[80px] cursor-pointer transition-colors hover:bg-accent/50",
                isToday && "bg-primary/5"
              )}
            >
              {/* Hora */}
              <div className="w-24 p-3 border-r text-sm text-right text-muted-foreground font-medium sticky left-0 bg-card">
                {hour === 0 ? 'Meia-noite' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              
              {/* Eventos */}
              <div className="flex-1 p-2 space-y-2">
                {hourEvents.map((event) => (
                  <ResizableEvent
                    key={event.id}
                    event={event}
                    onEventClick={onEventClick}
                    onResize={handleResize}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};