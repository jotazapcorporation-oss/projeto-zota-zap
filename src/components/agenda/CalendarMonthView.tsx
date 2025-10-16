import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarMonthViewProps {
  events: AgendaEvent[];
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: AgendaEvent) => void;
}

export const CalendarMonthView = ({
  events,
  selectedDate,
  onDateClick,
  onEventClick,
}: CalendarMonthViewProps) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.event_date), date)
    ).slice(0, 3); // Mostrar no máximo 3 eventos por dia
  };

  const getTotalEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.event_date), date)
    ).length;
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isCurrentMonth = (date: Date) => isSameMonth(date, selectedDate);

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border shadow-lg overflow-hidden">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-7 border-b bg-card">
        {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="flex-1 overflow-auto">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b last:border-b-0" style={{ minHeight: '120px' }}>
            {week.map((date, dayIdx) => {
              const dayEvents = getEventsForDate(date);
              const totalEvents = getTotalEventsForDate(date);
              const hasMore = totalEvents > 3;

              return (
                <div
                  key={dayIdx}
                  onClick={() => onDateClick(date)}
                  className={cn(
                    "border-r last:border-r-0 p-2 cursor-pointer transition-colors hover:bg-accent/50",
                    !isCurrentMonth(date) && "bg-muted/30",
                    isToday(date) && "bg-primary/10"
                  )}
                >
                  <div className={cn(
                    "text-sm font-semibold mb-1",
                    !isCurrentMonth(date) && "text-muted-foreground",
                    isToday(date) && "text-primary"
                  )}>
                    {format(date, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer",
                          "bg-primary text-primary-foreground",
                          "hover:opacity-90 transition-opacity"
                        )}
                        title={`${event.titulo} - ${event.event_time}`}
                      >
                        {event.event_time.substring(0, 5)} {event.titulo}
                      </div>
                    ))}
                    
                    {hasMore && (
                      <div className="text-xs text-muted-foreground font-medium">
                        +{totalEvents - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};