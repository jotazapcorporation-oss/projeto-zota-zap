import { useState } from 'react';
import { useAuth } from '@/hooks/useLocalAuth';
import { useSupabaseAgenda, AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { Button } from '@/components/ui/button';
import { EventCalendar } from '@/components/agenda/EventCalendar';
import { EventList } from '@/components/agenda/EventList';
import { EventModal } from '@/components/agenda/EventModal';
import { Plus, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Agenda() {
  const { user } = useAuth();
  const { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent } = useSupabaseAgenda(user?.id);
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<AgendaEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleSync = async () => {
    toast({
      title: '🔄 Sincronizando...',
      description: 'Atualizando eventos do WhatsApp',
    });
    await fetchEvents();
    toast({
      title: '✅ Sincronizado!',
      description: 'Agenda atualizada com sucesso',
    });
  };

  const handleNewEvent = () => {
    setEditEvent(null);
    setModalOpen(true);
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setEditEvent(event);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteEvent(deleteId);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-primary/20">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            Agenda VZAP
          </h1>
          <p className="text-muted-foreground">
            Organize seus eventos e compromissos de forma inteligente
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            variant="outline"
            className="hover:bg-primary/10 hover:border-primary transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
          <Button
            onClick={handleNewEvent}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:shadow-lg transition-all">
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-primary">{events.length}</p>
            <p className="text-sm text-muted-foreground">Total de Eventos</p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 hover:shadow-lg transition-all">
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-green-600">
              {events.filter(e => new Date(e.event_date) >= new Date()).length}
            </p>
            <p className="text-sm text-muted-foreground">Próximos</p>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 hover:shadow-lg transition-all">
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-blue-600">
              {new Set(events.map(e => e.event_date.split('-')[1])).size}
            </p>
            <p className="text-sm text-muted-foreground">Meses Ativos</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EventCalendar
            events={events}
            onDateSelect={setSelectedDate}
            onEventClick={handleEditEvent}
          />
        </div>

        <div className="lg:col-span-1">
          <EventList
            events={events}
            onEdit={handleEditEvent}
            onDelete={setDeleteId}
          />
        </div>
      </div>

      {/* Modals */}
      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={createEvent}
        onUpdate={updateEvent}
        editEvent={editEvent}
      />

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
    </div>
  );
}
