import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ResizableEvent } from './ResizableEvent';

interface CalendarWeekViewProps {
  events: AgendaEvent[];
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
  onEventClick: (event: AgendaEvent) => void;
  onEventResize?: (eventId: string, newEndTime: string) => void;
}

export const CalendarWeekView = ({
  events,
  selectedDate,
  onDateClick,
  onTimeSlotClick,
  onEventClick,
  onEventResize,
}: CalendarWeekViewProps) => {
  
  const handleResize = async (eventId: string, newEndTime: string) => {
    if (!onEventResize) return;
    await onEventResize(eventId, newEndTime);
  };
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Horas de 0 a 23
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      if (!isSameDay(parseISO(event.event_date), date)) return false;
      
      const eventHour = parseInt(event.event_time.split(':')[0]);
      return eventHour === hour;
    });
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border shadow-lg overflow-hidden">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-8 border-b bg-card sticky top-0 z-10">
        <div className="p-1 border-r text-xs text-center text-muted-foreground font-medium">
          GMT-3
        </div>
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            onClick={() => onDateClick(day)}
            className={cn(
              "p-2 border-r cursor-pointer transition-colors hover:bg-accent",
              isToday(day) && "bg-primary/10"
            )}
          >
            <div className="text-center">
              <div className="text-xs uppercase text-muted-foreground font-medium">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={cn(
                "text-xl font-semibold",
                isToday(day) && "text-primary"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid de horários */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8">
{hours.map((hour) => (
  <React.Fragment key={hour}>
    {/* Coluna de hora - FIXA */}
    <div 
      // 2) Remova border-r aqui
      className="p-2 border-b text-xs text-right text-muted-foreground sticky left-0 bg-card z-20"
    >
      {hour}
    </div>

    {/* Células de cada dia */}
    {weekDays.map((day, dayIdx) => {
      const dayEvents = getEventsForDateAndHour(day, hour);
      const timeString = `${hour.toString().padStart(2, '0')}:00`;

      return (
        <div
          key={`cell-${hour}-${dayIdx}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) onTimeSlotClick(day, timeString);
          }}
          className={cn(
            // 3) Mantém border-b/border-r como antes,
            //    mas adiciona border-l somente na primeira coluna de dias
            "min-h-[60px] border-b border-r p-1 cursor-pointer transition-colors hover:bg-accent/50 relative",
            dayIdx === 0 && "border-l",
            isToday(day) && "bg-primary/5"
          )}
        >
          {dayEvents.map((event) => (
            <ResizableEvent
              key={event.event_id}
              event={event}
              onEventClick={onEventClick}
              onResize={handleResize}
              compact
              className="absolute inset-x-1 top-1"
            />
          ))}
        </div>
      );
    })}
  </React.Fragment>
))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};