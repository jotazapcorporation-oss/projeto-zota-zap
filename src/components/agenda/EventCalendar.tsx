import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventCalendarProps {
  events: AgendaEvent[];
  onDateSelect: (date: Date | undefined) => void;
  onEventClick: (event: AgendaEvent) => void;
}

export const EventCalendar = ({ events, onDateSelect, onEventClick }: EventCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.event_date), date)
    );
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const eventsForSelectedDate = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-2 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            📅 Calendário
          </h2>
          {selectedDate && (
            <Badge variant="secondary" className="text-sm animate-fade-in">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </Badge>
          )}
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border-2 shadow-inner bg-background/50"
          modifiers={{
            hasEvents: (date) => hasEvents(date),
          }}
          modifiersClassNames={{
            hasEvents: 'bg-primary/20 font-bold text-primary hover:bg-primary/30',
          }}
        />

        {eventsForSelectedDate.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Eventos do dia:
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {eventsForSelectedDate.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={cn(
                    "p-3 rounded-lg border-l-4 border-primary bg-card/80 backdrop-blur-sm",
                    "cursor-pointer hover:bg-primary/10 hover:scale-[1.02]",
                    "transition-all duration-200 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        ⏰ {event.event_time}
                      </p>
                      {event.local && (
                        <p className="text-sm text-muted-foreground truncate">
                          📍 {event.local}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
