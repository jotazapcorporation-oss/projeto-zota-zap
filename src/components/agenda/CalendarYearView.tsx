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
  parseISO,
  setMonth
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarYearViewProps {
  events: AgendaEvent[];
  selectedDate: Date;
  onMonthClick: (date: Date) => void;
  onDateClick: (date: Date) => void;
}

export const CalendarYearView = ({
  events,
  selectedDate,
  onMonthClick,
  onDateClick,
}: CalendarYearViewProps) => {
  const months = Array.from({ length: 12 }, (_, i) => setMonth(selectedDate, i));

  const MiniMonth = ({ monthDate }: { monthDate: Date }) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
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

    const hasEvents = (date: Date) => {
      return events.some(event => isSameDay(parseISO(event.event_date), date));
    };

    const isToday = (date: Date) => isSameDay(date, new Date());
    const isCurrentMonth = (date: Date) => isSameMonth(date, monthDate);

    return (
      <div 
        className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer p-3"
        onClick={() => onMonthClick(monthDate)}
      >
        <div className="text-sm font-semibold mb-2 text-center">
          {format(monthDate, 'MMMM', { locale: ptBR })}
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px]">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-muted-foreground font-medium">
              {day}
            </div>
          ))}
          
          {weeks.map((week, weekIdx) => (
            week.map((date, dayIdx) => (
              <div
                key={`${weekIdx}-${dayIdx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDateClick(date);
                }}
                className={cn(
                  "aspect-square flex items-center justify-center rounded cursor-pointer transition-colors",
                  !isCurrentMonth(date) && "text-muted-foreground/50",
                  isCurrentMonth(date) && "hover:bg-accent",
                  isToday(date) && "bg-primary text-primary-foreground font-bold",
                  hasEvents(date) && !isToday(date) && "bg-primary/20 font-semibold"
                )}
              >
                {format(date, 'd')}
              </div>
            ))
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-background rounded-lg border shadow-lg overflow-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">{format(selectedDate, 'yyyy')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month, idx) => (
          <MiniMonth key={idx} monthDate={month} />
        ))}
      </div>
    </div>
  );
};