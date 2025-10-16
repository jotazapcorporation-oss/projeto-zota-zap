import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, ChecklistItem, Etiqueta } from '@/hooks/useSupabaseBoards';
import { useCardEnhancements } from '@/hooks/useCardEnhancements';
import { Plus, Trash2, Tag, Calendar, Send, Paperclip, Clock, MessageSquare, Image, Copy, X, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableFormField } from './DraggableFormField';
import { SortableChecklistItem } from './SortableChecklistItem';
import { DraggableTabWrapper } from './DraggableTabWrapper';

const COR_ETIQUETAS = [
  { nome: 'Verde', cor: '#22c55e' },
  { nome: 'Azul', cor: '#3b82f6' },
  { nome: 'Amarelo', cor: '#eab308' },
  { nome: 'Laranja', cor: '#f97316' },
  { nome: 'Vermelho', cor: '#ef4444' },
  { nome: 'Roxo', cor: '#a855f7' },
  { nome: 'Rosa', cor: '#ec4899' },
];

interface EnhancedCardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (card: Partial<Card>) => void;
  onDuplicate?: (cardId: string) => Promise<void>;
  onUploadCover?: (cardId: string, file: File) => Promise<string | undefined>;
  onRemoveCover?: (cardId: string, imageUrl: string) => Promise<void>;
  card?: Card | null;
}

type FormFieldId = 'cover' | 'titulo' | 'descricao' | 'dates' | 'reminder' | 'etiquetas' | 'checklist';
type TabId = 'details' | 'comments' | 'attachments' | 'checklist';

export const EnhancedCardModal = ({ open, onClose, onSave, onDuplicate, onUploadCover, onRemoveCover, card }: EnhancedCardModalProps) => {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [startDate, setStartDate] = useState('');
  const [reminderDays, setReminderDays] = useState(1);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState('');
  const [corSelecionada, setCorSelecionada] = useState(COR_ETIQUETAS[0].cor);
  const [novoChecklistItem, setNovoChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [fieldOrder, setFieldOrder] = useState<FormFieldId[]>(['cover', 'titulo', 'descricao', 'dates', 'reminder', 'etiquetas', 'checklist']);
  const [tabOrder, setTabOrder] = useState<TabId[]>(['details', 'checklist', 'comments', 'attachments']);
  const [activeTab, setActiveTab] = useState<TabId>('details');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const {
    comments,
    attachments,
    activities,
    loading,
    addComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
  } = useCardEnhancements(card?.id || null);

  useEffect(() => {
    if (card) {
      setTitulo(card.titulo);
      setDescricao(card.descricao || '');
      setDataVencimento(card.data_vencimento || '');
      setStartDate((card as any).start_date || '');
      setReminderDays((card as any).reminder_days || 1);
      setEtiquetas(card.etiquetas || []);
      setChecklist(card.checklist || []);
      setCoverImage(card.cover_image || null);
    } else {
      resetForm();
    }
  }, [card, open]);

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setDataVencimento('');
    setStartDate('');
    setReminderDays(1);
    setEtiquetas([]);
    setChecklist([]);
    setNovaEtiqueta('');
    setNovoChecklistItem('');
    setNewComment('');
    setNewAttachmentUrl('');
    setCoverImage(null);
  };

  const adicionarEtiqueta = () => {
    if (!novaEtiqueta.trim()) return;
    
    const novaEtiquetaObj: Etiqueta = {
      id: Date.now().toString(),
      texto: novaEtiqueta.trim(),
      cor: corSelecionada,
    };
    
    setEtiquetas([...etiquetas, novaEtiquetaObj]);
    setNovaEtiqueta('');
  };

  const removerEtiqueta = (id: string) => {
    setEtiquetas(etiquetas.filter(etiqueta => etiqueta.id !== id));
  };

  const adicionarChecklistItem = () => {
    if (!novoChecklistItem.trim()) return;
    
    const novoItem: ChecklistItem = {
      id: Date.now().toString(),
      texto: novoChecklistItem.trim(),
      concluido: false,
    };
    
    setChecklist([...checklist, novoItem]);
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

  const handleDragEndField = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFieldOrder((items) => {
        const oldIndex = items.indexOf(active.id as FormFieldId);
        const newIndex = items.indexOf(over.id as FormFieldId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndTab = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTabOrder((items) => {
        const oldIndex = items.indexOf(active.id as TabId);
        const newIndex = items.indexOf(over.id as TabId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndChecklist = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChecklist((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    if (!titulo.trim()) return;

    const cardData: Partial<Card> = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      data_vencimento: dataVencimento || undefined,
      cover_image: coverImage,
      etiquetas,
      checklist,
      display_order: card?.display_order || 0,
      ...(startDate && { start_date: startDate }),
      ...(reminderDays && { reminder_days: reminderDays }),
    };

    onSave(cardData);
    onClose();
    resetForm();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !card?.id || !onUploadCover) return;

    setIsUploadingCover(true);
    try {
      const url = await onUploadCover(card.id, file);
      if (url) {
        setCoverImage(url);
      }
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!card?.id || !coverImage || !onRemoveCover) return;
    await onRemoveCover(card.id, coverImage);
    setCoverImage(null);
  };

  const handleDuplicate = async () => {
    if (!card?.id || !onDuplicate) return;
    await onDuplicate(card.id);
    onClose();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(newComment);
    setNewComment('');
  };

  const handleAddAttachment = async () => {
    if (!newAttachmentUrl.trim()) return;
    const fileName = newAttachmentUrl.split('/').pop() || 'attachment';
    await addAttachment(newAttachmentUrl, fileName);
    setNewAttachmentUrl('');
  };

  const checklistConcluidos = checklist.filter(i => i.concluido).length;
  const checklistTotal = checklist.length;
  const progressoChecklist = checklistTotal > 0 ? (checklistConcluidos / checklistTotal) * 100 : 0;

  const formFields: Record<FormFieldId, JSX.Element> = {
    cover: (
      <div key="cover">
        <Label className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Imagem de Capa
        </Label>
        {coverImage ? (
          <div className="relative mt-2 rounded-lg overflow-hidden">
            <img src={coverImage} alt="Cover" className="w-full h-48 object-cover" />
            <Button size="sm" variant="destructive" className="absolute top-2 right-2 gap-1" onClick={handleRemoveCover}>
              <X className="h-3 w-3" />
              Remover
            </Button>
          </div>
        ) : (
          <div className="mt-2">
            <Input id="cover-upload" type="file" accept="image/*" onChange={handleCoverUpload} disabled={!card || isUploadingCover} className="hidden" />
            <Button variant="outline" onClick={() => document.getElementById('cover-upload')?.click()} disabled={!card || isUploadingCover} className="w-full gap-2">
              <Image className="h-4 w-4" />
              {isUploadingCover ? 'Enviando...' : card ? 'Adicionar Imagem' : 'Salve o card primeiro'}
            </Button>
          </div>
        )}
      </div>
    ),
    titulo: (
      <div key="titulo">
        <Label htmlFor="titulo">Título *</Label>
        <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Digite o título do card" className="mt-1" />
      </div>
    ),
    descricao: (
      <div key="descricao">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Adicione uma descrição detalhada" className="mt-1 min-h-[100px]" />
      </div>
    ),
    dates: (
      <div key="dates" className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Início
          </Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="dataVencimento" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Vencimento
          </Label>
          <Input id="dataVencimento" type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="mt-1" />
        </div>
      </div>
    ),
    reminder: (
      <div key="reminder">
        <Label htmlFor="reminder" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Lembrete (dias antes)
        </Label>
        <Input id="reminder" type="number" min="1" max="30" value={reminderDays} onChange={(e) => setReminderDays(parseInt(e.target.value) || 1)} className="mt-1" />
      </div>
    ),
    etiquetas: (
      <div key="etiquetas">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Etiquetas
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {etiquetas.map((etiqueta) => (
            <div key={etiqueta.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: etiqueta.cor }}>
              {etiqueta.texto}
              <button onClick={() => removerEtiqueta(etiqueta.id)} className="ml-1 hover:opacity-70">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input value={novaEtiqueta} onChange={(e) => setNovaEtiqueta(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarEtiqueta()} placeholder="Nova etiqueta" className="flex-1" />
          <div className="flex gap-1">
            {COR_ETIQUETAS.slice(0, 4).map((cor) => (
              <button key={cor.cor} type="button" onClick={() => setCorSelecionada(cor.cor)} className={cn("w-8 h-8 rounded-full border-2 transition-all", corSelecionada === cor.cor ? "border-foreground scale-110" : "border-transparent")} style={{ backgroundColor: cor.cor }} />
            ))}
          </div>
          <Button size="icon" onClick={adicionarEtiqueta} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
    checklist: (
      <div key="checklist">
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
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressoChecklist}%` }} />
          </div>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndChecklist}>
          <SortableContext items={checklist.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {checklist.map((item) => (
                <SortableChecklistItem key={item.id} item={item} onToggle={toggleChecklistItem} onRemove={removerChecklistItem} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex gap-2 mt-3">
          <Input value={novoChecklistItem} onChange={(e) => setNovoChecklistItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarChecklistItem()} placeholder="Adicionar item" className="flex-1" />
          <Button size="icon" onClick={adicionarChecklistItem} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{card ? 'Editar Card' : 'Novo Card'}</DialogTitle>
            {card && onDuplicate && (
              <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicar Card
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="h-full flex flex-col">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndTab}>
              <SortableContext items={tabOrder} strategy={horizontalListSortingStrategy}>
                <TabsList className="grid w-full group" style={{ gridTemplateColumns: `repeat(${tabOrder.length}, 1fr)` }}>
                  {tabOrder.map((tabId) => {
                    const tabConfig = {
                      details: { label: 'Detalhes', icon: null },
                      checklist: { label: 'Checklist', icon: <ListChecks className="h-4 w-4 mr-2" /> },
                      comments: { label: `Comentários (${comments.length})`, icon: <MessageSquare className="h-4 w-4 mr-2" /> },
                      attachments: { label: `Anexos (${attachments.length})`, icon: <Paperclip className="h-4 w-4 mr-2" /> },
                    }[tabId];

                    return (
                      <DraggableTabWrapper key={tabId} id={tabId} value={tabId} isActive={activeTab === tabId}>
                        {tabConfig.icon}
                        {tabConfig.label}
                      </DraggableTabWrapper>
                    );
                  })}
                </TabsList>
              </SortableContext>
            </DndContext>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="details" className="space-y-4 mt-0">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndField}>
                  <SortableContext items={fieldOrder} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {fieldOrder.map((fieldId) => (
                        <DraggableFormField key={fieldId} id={fieldId}>
                          {formFields[fieldId]}
                        </DraggableFormField>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={!titulo.trim()} className="flex-1">
                    Salvar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="checklist" className="mt-0 space-y-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        Checklist da Meta
                      </h3>
                      {checklistTotal > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-semibold">{checklistConcluidos}/{checklistTotal} ({Math.round(progressoChecklist)}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3">
                            <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${progressoChecklist}%` }} />
                          </div>
                        </div>
                      )}
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndChecklist}>
                        <SortableContext items={checklist.map(i => i.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-2">
                            {checklist.map((item) => (
                              <SortableChecklistItem key={item.id} item={item} onToggle={toggleChecklistItem} onRemove={removerChecklistItem} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <div className="flex gap-2 mt-4">
                        <Input value={novoChecklistItem} onChange={(e) => setNovoChecklistItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && adicionarChecklistItem()} placeholder="Adicionar item ao checklist" className="flex-1" />
                        <Button size="icon" onClick={adicionarChecklistItem} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="comments" className="mt-0 space-y-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.avatar_url} />
                          <AvatarFallback>{comment.user?.nome?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{comment.user?.nome || 'Usuário'}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                          <Button size="sm" variant="ghost" onClick={() => deleteComment(comment.id)} className="h-6 px-2 mt-1 text-xs hover:text-destructive">
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                  <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()} placeholder="Escrever um comentário..." className="flex-1" />
                  <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="mt-0 space-y-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                              {attachment.file_name}
                            </a>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(attachment.uploaded_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => deleteAttachment(attachment.id)} className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                  <Input value={newAttachmentUrl} onChange={(e) => setNewAttachmentUrl(e.target.value)} placeholder="URL do anexo" className="flex-1" />
                  <Button onClick={handleAddAttachment} disabled={!newAttachmentUrl.trim()}>
                    Adicionar
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
