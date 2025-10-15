import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, ChecklistItem, Etiqueta } from '@/hooks/useSupabaseBoards';
import { Plus, Trash2, Tag, Calendar, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DraggableFormField } from './DraggableFormField';
import { useCardFormLayout, FormFieldId } from '@/hooks/useCardFormLayout';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COR_ETIQUETAS = [
  { nome: 'Verde', cor: '#22c55e' },
  { nome: 'Azul', cor: '#3b82f6' },
  { nome: 'Amarelo', cor: '#eab308' },
  { nome: 'Laranja', cor: '#f97316' },
  { nome: 'Vermelho', cor: '#ef4444' },
  { nome: 'Roxo', cor: '#a855f7' },
  { nome: 'Rosa', cor: '#ec4899' },
];

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (card: Partial<Card>) => void;
  card?: Card | null;
}

export const CardModal = ({ open, onClose, onSave, card }: CardModalProps) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState('');
  const [corSelecionada, setCorSelecionada] = useState(COR_ETIQUETAS[0].cor);
  const [novoChecklistItem, setNovoChecklistItem] = useState('');
  
  const { fieldOrder, saveFieldOrder, resetToDefault } = useCardFormLayout();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (card) {
      setTitulo(card.titulo);
      setDescricao(card.descricao || '');
      setDataVencimento(card.data_vencimento || '');
      setEtiquetas(card.etiquetas || []);
      setChecklist(card.checklist || []);
    } else {
      resetForm();
    }
  }, [card, open]);

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setDataVencimento('');
    setEtiquetas([]);
    setChecklist([]);
    setNovaEtiqueta('');
    setNovoChecklistItem('');
  };

  const adicionarEtiqueta = () => {
    if (!novaEtiqueta.trim()) return;

    const etiqueta: Etiqueta = {
      id: Date.now().toString(),
      texto: novaEtiqueta.trim(),
      cor: corSelecionada,
    };

    setEtiquetas([...etiquetas, etiqueta]);
    setNovaEtiqueta('');
  };

  const removerEtiqueta = (id: string) => {
    setEtiquetas(etiquetas.filter(e => e.id !== id));
  };

  const adicionarChecklistItem = () => {
    if (!novoChecklistItem.trim()) return;

    const item: ChecklistItem = {
      id: Date.now().toString(),
      texto: novoChecklistItem.trim(),
      concluido: false,
    };

    setChecklist([...checklist, item]);
    setNovoChecklistItem('');
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, concluido: !item.concluido } : item
    ));
  };

  const removerChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (!titulo.trim()) return;

    const cardData: Partial<Card> = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      data_vencimento: dataVencimento || undefined,
      etiquetas,
      checklist,
      display_order: card?.display_order || 0,
    };

    onSave(cardData);
    onClose();
    resetForm();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = fieldOrder.findIndex(id => id === active.id);
    const newIndex = fieldOrder.findIndex(id => id === over.id);

    const newOrder = arrayMove(fieldOrder, oldIndex, newIndex);
    saveFieldOrder(newOrder);
  };

  // Form field components
  const checklistConcluidos = checklist.filter(i => i.concluido).length;
  const checklistTotal = checklist.length;
  const progressoChecklist = checklistTotal > 0 ? (checklistConcluidos / checklistTotal) * 100 : 0;
  
  const formFields: Record<FormFieldId, JSX.Element> = {
    titulo: (
      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Digite o título do card"
          className="mt-1"
        />
      </div>
    ),
    descricao: (
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Adicione uma descrição detalhada (opcional)"
          className="mt-1 min-h-[80px]"
        />
      </div>
    ),
    data_vencimento: (
      <div>
        <Label htmlFor="data" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Data de Vencimento
        </Label>
        <Input
          id="data"
          type="date"
          value={dataVencimento}
          onChange={(e) => setDataVencimento(e.target.value)}
          className="mt-1"
        />
      </div>
    ),
    etiquetas: (
      <div>
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Etiquetas
        </Label>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {etiquetas.map((etiqueta) => (
            <div
              key={etiqueta.id}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: etiqueta.cor }}
            >
              {etiqueta.texto}
              <button
                onClick={() => removerEtiqueta(etiqueta.id)}
                className="ml-1 hover:opacity-70"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <Input
            value={novaEtiqueta}
            onChange={(e) => setNovaEtiqueta(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarEtiqueta()}
            placeholder="Nova etiqueta"
            className="flex-1"
          />
          <div className="flex gap-1">
            {COR_ETIQUETAS.slice(0, 4).map((cor) => (
              <button
                key={cor.cor}
                type="button"
                onClick={() => setCorSelecionada(cor.cor)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  corSelecionada === cor.cor ? "border-foreground scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: cor.cor }}
              />
            ))}
          </div>
          <Button size="icon" onClick={adicionarEtiqueta} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
    checklist: (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Checklist</Label>
          {checklistTotal > 0 && (
            <span className="text-xs text-muted-foreground">
              {checklistConcluidos}/{checklistTotal} ({Math.round(progressoChecklist)}%)
            </span>
          )}
        </div>

        {checklistTotal > 0 && (
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressoChecklist}%` }}
            />
          </div>
        )}

        <div className="space-y-2">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
              <Checkbox
                checked={item.concluido}
                onCheckedChange={() => toggleChecklistItem(item.id)}
              />
              <span className={cn(
                "flex-1 text-sm",
                item.concluido && "line-through text-muted-foreground"
              )}>
                {item.texto}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removerChecklistItem(item.id)}
                className="h-7 w-7 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <Input
            value={novoChecklistItem}
            onChange={(e) => setNovoChecklistItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarChecklistItem()}
            placeholder="Adicionar item"
            className="flex-1"
          />
          <Button size="icon" onClick={adicionarChecklistItem} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{card ? 'Editar Card' : 'Novo Card'}</DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={resetToDefault}
                    className="h-8 gap-2 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restaurar ordem
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Restaurar ordem padrão dos campos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">
            Arraste os campos para personalizar a ordem do formulário
          </p>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fieldOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pl-8">
              {fieldOrder.map((fieldId) => (
                <DraggableFormField key={fieldId} id={fieldId}>
                  {formFields[fieldId]}
                </DraggableFormField>
              ))}
            </div>
          </SortableContext>
        </DndContext>

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
