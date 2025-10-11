import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, Clock, Calendar } from 'lucide-react';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventListProps {
  events: AgendaEvent[];
  onEdit: (event: AgendaEvent) => void;
  onDelete: (id: string) => void;
}

export const EventList = ({ events, onEdit, onDelete }: EventListProps) => {
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = parseISO(a.event_date);
    const dateB = parseISO(b.event_date);
    return dateA.getTime() - dateB.getTime();
  });

  const upcomingEvents = sortedEvents.filter(event => 
    isFuture(parseISO(event.event_date)) || 
    format(parseISO(event.event_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const pastEvents = sortedEvents.filter(event => 
    isPast(parseISO(event.event_date)) && 
    format(parseISO(event.event_date), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')
  );

  const EventCard = ({ event, isPastEvent = false }: { event: AgendaEvent, isPastEvent?: boolean }) => (
    <Card 
      className={cn(
        "p-4 border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        "bg-gradient-to-r from-card to-card/50 backdrop-blur-sm",
        isPastEvent 
          ? "border-l-muted-foreground/30 opacity-60" 
          : "border-l-primary animate-fade-in"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "font-semibold text-lg",
            isPastEvent && "line-through text-muted-foreground"
          )}>
            {event.titulo}
          </h3>
          {!isPastEvent && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(event)}
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(event.id)}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(parseISO(event.event_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{event.event_time}</span>
          </div>

          {event.local && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.local}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            📋 Próximos Eventos
          </h2>
          <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
            {upcomingEvents.length} {upcomingEvents.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {upcomingEvents.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-muted-foreground">
                Nenhum evento próximo agendado
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Novo Evento" para começar! 🎉
              </p>
            </Card>
          ) : (
            upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>

      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            📚 Eventos Passados
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} isPastEvent />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
