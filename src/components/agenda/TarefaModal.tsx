import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, MapPin, Clock } from 'lucide-react';
import { Tarefa, Subtarefa } from '@/hooks/useSupabaseTarefas';

interface TarefaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tarefa: Partial<Tarefa>) => void;
  tarefa?: Tarefa | null;
}

export const TarefaModal = ({ open, onClose, onSave, tarefa }: TarefaModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [horario, setHorario] = useState('');
  const [prioridade, setPrioridade] = useState<'urgente' | 'fazer_depois' | 'normal'>('normal');
  const [subtarefas, setSubtarefas] = useState<Subtarefa[]>([]);
  const [novaSubtarefa, setNovaSubtarefa] = useState('');

  useEffect(() => {
    if (tarefa) {
      setTitulo(tarefa.titulo);
      setDescricao(tarefa.descricao || '');
      setLocal(tarefa.local || '');
      setHorario(tarefa.horario || '');
      setPrioridade(tarefa.prioridade);
      setSubtarefas(tarefa.subtarefas || []);
    } else {
      resetForm();
    }
  }, [tarefa, open]);

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setLocal('');
    setHorario('');
    setPrioridade('normal');
    setSubtarefas([]);
    setNovaSubtarefa('');
  };

  const handleSave = () => {
    if (!titulo.trim()) return;

    const tarefaData: Partial<Tarefa> = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      local: local.trim() || undefined,
      horario: horario || undefined,
      prioridade,
      subtarefas,
      concluida: tarefa?.concluida || false,
      display_order: tarefa?.display_order || 0,
    };

    onSave(tarefaData);
    onClose();
    resetForm();
  };

  const adicionarSubtarefa = () => {
    if (!novaSubtarefa.trim()) return;

    const novaSubtarefaObj: Subtarefa = {
      id: Date.now().toString(),
      texto: novaSubtarefa.trim(),
      concluida: false,
    };

    setSubtarefas([...subtarefas, novaSubtarefaObj]);
    setNovaSubtarefa('');
  };

  const toggleSubtarefa = (id: string) => {
    setSubtarefas(subtarefas.map(st =>
      st.id === id ? { ...st, concluida: !st.concluida } : st
    ));
  };

  const removerSubtarefa = (id: string) => {
    setSubtarefas(subtarefas.filter(st => st.id !== id));
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500';
      case 'fazer_depois': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título da Tarefa *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da tarefa"
              className="mt-1"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição / Detalhes</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Adicione detalhes sobre a tarefa (opcional)"
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Local e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="local" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local
              </Label>
              <Input
                id="local"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Local (opcional)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="horario" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </Label>
              <Input
                id="horario"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <Label>Prioridade</Label>
            <RadioGroup value={prioridade} onValueChange={(value: any) => setPrioridade(value)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgente" id="urgente" />
                <Label htmlFor="urgente" className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-3 h-3 rounded-full ${getPrioridadeColor('urgente')}`} />
                  Urgente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fazer_depois" id="fazer_depois" />
                <Label htmlFor="fazer_depois" className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-3 h-3 rounded-full ${getPrioridadeColor('fazer_depois')}`} />
                  Fazer Depois
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-3 h-3 rounded-full ${getPrioridadeColor('normal')}`} />
                  Normal
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Subtarefas */}
          <div>
            <Label>Subtarefas</Label>
            <div className="mt-2 space-y-2">
              {subtarefas.map((subtarefa) => (
                <div key={subtarefa.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                  <Checkbox
                    checked={subtarefa.concluida}
                    onCheckedChange={() => toggleSubtarefa(subtarefa.id)}
                  />
                  <span className={`flex-1 text-sm ${subtarefa.concluida ? 'line-through text-muted-foreground' : ''}`}>
                    {subtarefa.texto}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removerSubtarefa(subtarefa.id)}
                    className="h-7 w-7 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={novaSubtarefa}
                  onChange={(e) => setNovaSubtarefa(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionarSubtarefa()}
                  placeholder="Adicionar subtarefa"
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={adicionarSubtarefa}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!titulo.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
