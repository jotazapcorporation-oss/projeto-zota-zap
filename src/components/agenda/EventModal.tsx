import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AgendaEvent } from '@/hooks/useSupabaseAgenda';
import { format } from 'date-fns';

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (eventData: Omit<AgendaEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<any>;
  onUpdate?: (id: string, eventData: Partial<AgendaEvent>) => Promise<void>;
  editEvent?: AgendaEvent | null;
}

export const EventModal = ({ open, onOpenChange, onSave, onUpdate, editEvent }: EventModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [local, setLocal] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editEvent) {
      setTitulo(editEvent.titulo);
      setEventDate(editEvent.event_date);
      setEventTime(editEvent.event_time);
      setLocal(editEvent.local || '');
    } else {
      setTitulo('');
      setEventDate(format(new Date(), 'yyyy-MM-dd'));
      setEventTime('12:00');
      setLocal('');
    }
  }, [editEvent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        titulo,
        event_date: eventDate,
        event_time: eventTime,
        local: local || null,
      };

      if (editEvent && onUpdate) {
        await onUpdate(editEvent.id, eventData);
      } else {
        await onSave(eventData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {editEvent ? '✏️ Editar Evento' : '➕ Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-sm font-semibold">
              🏷️ Título do Evento
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reunião com cliente"
              required
              className="border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold">
                📅 Data
              </Label>
              <Input
                id="date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold">
                ⏰ Hora
              </Label>
              <Input
                id="time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                required
                className="border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local" className="text-sm font-semibold">
              📍 Local (opcional)
            </Label>
            <Input
              id="local"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex: Escritório, Sala 203"
              className="border-2 focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 hover:bg-muted"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? '💾 Salvando...' : '💾 Salvar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
