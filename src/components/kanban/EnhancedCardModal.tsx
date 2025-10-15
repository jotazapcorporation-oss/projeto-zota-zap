import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, ChecklistItem, Etiqueta } from '@/hooks/useSupabaseBoards';
import { useCardEnhancements } from '@/hooks/useCardEnhancements';
import { Plus, Trash2, Tag, Calendar, Send, Paperclip, Users, Clock, MessageSquare, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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
  card?: Card | null;
}

export const EnhancedCardModal = ({ open, onClose, onSave, onDuplicate, card }: EnhancedCardModalProps) => {
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
  
  const {
    comments,
    attachments,
    members,
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
      ...(startDate && { start_date: startDate }),
      ...(reminderDays && { reminder_days: reminderDays }),
    };

    onSave(cardData);
    onClose();
    resetForm();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{card ? 'Editar Card' : 'Novo Card'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="details" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comentários ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="attachments">
                <Paperclip className="h-4 w-4 mr-2" />
                Anexos ({attachments.length})
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Atividade
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="details" className="space-y-4 mt-0">
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

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Adicione uma descrição detalhada"
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Início
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataVencimento" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Vencimento
                    </Label>
                    <Input
                      id="dataVencimento"
                      type="date"
                      value={dataVencimento}
                      onChange={(e) => setDataVencimento(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reminder" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Lembrete (dias antes)
                  </Label>
                  <Input
                    id="reminder"
                    type="number"
                    min="1"
                    max="30"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>

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
                        <button onClick={() => removerEtiqueta(etiqueta.id)} className="ml-1 hover:opacity-70">
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
                        <span className={cn("flex-1 text-sm", item.concluido && "line-through text-muted-foreground")}>
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

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={!titulo.trim()} className="flex-1">
                    Salvar
                  </Button>
                </div>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteComment(comment.id)}
                            className="h-6 px-2 mt-1 text-xs hover:text-destructive"
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                    placeholder="Escrever um comentário..."
                    className="flex-1"
                  />
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
                            <a
                              href={attachment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline"
                            >
                              {attachment.file_name}
                            </a>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(attachment.uploaded_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAttachment(attachment.id)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    placeholder="URL do anexo"
                    className="flex-1"
                  />
                  <Button onClick={handleAddAttachment} disabled={!newAttachmentUrl.trim()}>
                    Adicionar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
