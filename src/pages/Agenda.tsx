import { useState } from 'react';
import { useAuth } from '@/hooks/useLocalAuth';
import { useSupabaseAgenda, AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { Button } from '@/components/ui/button';
import { EventModal } from '@/components/agenda/EventModal';
import { CalendarDayView } from '@/components/agenda/CalendarDayView';
import { CalendarWeekView } from '@/components/agenda/CalendarWeekView';
import { CalendarMonthView } from '@/components/agenda/CalendarMonthView';
import { CalendarYearView } from '@/components/agenda/CalendarYearView';
import { TasksPanel } from '@/components/agenda/TasksPanel';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TutorialButton } from '@/components/ui/tutorial-button';
import { TutorialModal } from '@/components/ui/tutorial-modal';
import { useTutorial } from '@/hooks/useTutorial';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addDays, addMonths, addYears, subDays, subMonths, subYears, format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
type ViewMode = 'day' | 'week' | 'month' | 'year';
export default function Agenda() {
  const {
    user
  } = useAuth();
  const {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  } = useSupabaseAgenda(user?.id);
  const {
    toast
  } = useToast();
  const tutorial = useTutorial('agenda');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<AgendaEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const [prefilledTime, setPrefilledTime] = useState<string | null>(null);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const handleNewEvent = (date?: Date, time?: string) => {
    setEditEvent(null);
    setPrefilledDate(date || null);
    setPrefilledTime(time || null);
    setModalOpen(true);
  };
  const handleEditEvent = (event: AgendaEvent) => {
    setEditEvent(event);
    setPrefilledDate(null);
    setPrefilledTime(null);
    setModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteEvent(deleteId);
      setDeleteId(null);
    }
  };
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };
  const handleTimeSlotClick = (date: Date, time: string) => {
    handleNewEvent(date, time);
  };
  const handleDayTimeSlotClick = (time: string) => {
    handleNewEvent(selectedDate, time);
  };

  const handleEventResize = async (eventId: string, newEndTime: string) => {
    await updateEvent(eventId, { end_time: newEndTime });
  };
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(subDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(subDays(selectedDate, 7));
        break;
      case 'month':
        setSelectedDate(subMonths(selectedDate, 1));
        break;
      case 'year':
        setSelectedDate(subYears(selectedDate, 1));
        break;
    }
  };
  const navigateNext = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(addDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(addDays(selectedDate, 7));
        break;
      case 'month':
        setSelectedDate(addMonths(selectedDate, 1));
        break;
      case 'year':
        setSelectedDate(addYears(selectedDate, 1));
        break;
    }
  };
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, "d 'de' MMMM 'de' yyyy", {
          locale: ptBR
        });
      case 'week':
        const weekStart = startOfWeek(selectedDate, {
          weekStartsOn: 0
        });
        const weekEnd = endOfWeek(selectedDate, {
          weekStartsOn: 0
        });
        return `${format(weekStart, 'd MMM', {
          locale: ptBR
        })} - ${format(weekEnd, 'd MMM yyyy', {
          locale: ptBR
        })}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy', {
          locale: ptBR
        });
      case 'year':
        return format(selectedDate, 'yyyy');
    }
  };
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date()).length;
  const activeMonths = new Set(events.map(e => e.event_date.split('-')[1])).size;
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>;
  }
  return <div className="h-[calc(100vh-4rem)] flex flex-col gap-2 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-2 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
          
          <Button onClick={() => handleNewEvent()} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Criar</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-accent">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={date => {
              if (date) {
                setSelectedDate(date);
                setViewMode('day');
              }
            }} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button variant="ghost" size="icon" onClick={navigatePrevious} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={navigateNext} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </div>

        <div className="flex-1 min-w-[200px] text-center">
          <h2 className="text-lg font-semibold capitalize">{getHeaderTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={tasksDialogOpen} onOpenChange={setTasksDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                Minhas Tarefas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Minhas Tarefas</DialogTitle>
              </DialogHeader>
              <div className="overflow-auto max-h-[calc(90vh-8rem)]">
                <TasksPanel />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content - Calendar Only */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'day' && <CalendarDayView events={events} selectedDate={selectedDate} onTimeSlotClick={handleDayTimeSlotClick} onEventClick={handleEditEvent} onEventResize={handleEventResize} />}

        {viewMode === 'week' && <CalendarWeekView events={events} selectedDate={selectedDate} onDateClick={handleDateClick} onTimeSlotClick={handleTimeSlotClick} onEventClick={handleEditEvent} onEventResize={handleEventResize} />}

        {viewMode === 'month' && <CalendarMonthView events={events} selectedDate={selectedDate} onDateClick={handleDateClick} onEventClick={handleEditEvent} />}

        {viewMode === 'year' && <CalendarYearView events={events} selectedDate={selectedDate} onMonthClick={date => {
        setSelectedDate(date);
        setViewMode('month');
      }} onDateClick={handleDateClick} />}
      </div>

      {/* Modals */}
      <EventModal open={modalOpen} onOpenChange={setModalOpen} onSave={createEvent} onUpdate={updateEvent} onDelete={deleteEvent} editEvent={editEvent} prefilledDate={prefilledDate} prefilledTime={prefilledTime} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O evento será removido permanentemente da sua agenda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TutorialModal isOpen={tutorial.isOpen} onClose={() => tutorial.setIsOpen(false)} sectionId="agenda" progress={tutorial.progress} onToggleStep={tutorial.toggleStep} onReset={tutorial.resetProgress} />
    </div>;
}