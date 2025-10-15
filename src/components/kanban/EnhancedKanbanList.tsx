import { useState } from 'react';
import { Lista, Card } from '@/hooks/useSupabaseBoards';
import { EnhancedKanbanCard } from './EnhancedKanbanCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreVertical, Trash2, GripVertical, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedKanbanListProps {
  lista: Lista;
  onAddCard: (listaId: string, titulo: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteList: (id: string) => void;
  onUpdateListTitle: (id: string, titulo: string) => void;
}

export const EnhancedKanbanList = ({ lista, onAddCard, onEditCard, onDeleteList, onUpdateListTitle }: EnhancedKanbanListProps) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(lista.titulo);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lista.id });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: lista.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(lista.id, newCardTitle);
      setNewCardTitle('');
      // Keep adding mode for quick multiple additions
    }
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== lista.titulo) {
      onUpdateListTitle(lista.id, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setEditedTitle(lista.titulo);
    setIsEditingTitle(false);
  };

  return (
    <motion.div
      ref={setSortableRef}
      style={style}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      className={cn(
        "flex-shrink-0 w-[320px] rounded-xl p-4 flex flex-col max-h-full",
        "bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-sm",
        "border-2 border-border/50",
        isDragging && "ring-2 ring-primary shadow-2xl"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-accent rounded-lg transition-colors"
          aria-label="Arrastar lista"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {isEditingTitle ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') handleCancelTitleEdit();
            }}
            onBlur={handleSaveTitle}
            placeholder="Nome da lista..."
            autoFocus
            maxLength={60}
            className="flex-1 h-8 font-bold text-base"
          />
        ) : (
          <div 
            className="flex-1 flex items-center gap-2 group cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            <h3 className="font-bold text-base">
              {lista.titulo}
            </h3>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded-full">
            {lista.cards?.length || 0}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" aria-label="Opções da lista">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDeleteList(lista.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir lista
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Card - Moved to top */}
      {isAddingCard && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 mb-3"
        >
          <Input
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCardTitle.trim()) {
                handleAddCard();
              }
              if (e.key === 'Escape') {
                setIsAddingCard(false);
                setNewCardTitle('');
              }
            }}
            placeholder="Título do card..."
            autoFocus
            className="h-10 bg-background"
            maxLength={100}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddCard}
              className="flex-1 h-9"
              disabled={!newCardTitle.trim()}
            >
              Adicionar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle('');
              }}
              className="h-9"
            >
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Cards */}
      <div
        ref={setDroppableRef}
        className={cn(
          "flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
          "transition-colors rounded-lg",
          isDragging && "bg-accent/20 ring-2 ring-primary/30"
        )}
        style={{ maxHeight: 'calc(100vh - 340px)' }}
      >
        <SortableContext
          items={(lista.cards || []).map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {lista.cards?.map((card) => (
            <EnhancedKanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Card Button - at bottom */}
      {!isAddingCard && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingCard(true)}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent h-10 rounded-lg transition-all"
            aria-label="Adicionar novo card"
          >
            <Plus className="h-4 w-4" />
            Adicionar card
          </Button>
        </div>
      )}
    </motion.div>
  );
};
