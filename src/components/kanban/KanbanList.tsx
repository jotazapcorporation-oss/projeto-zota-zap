import { useState } from 'react';
import { Lista, Card } from '@/hooks/useSupabaseBoards';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreVertical, Trash2, GripVertical } from 'lucide-react';
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

interface KanbanListProps {
  lista: Lista;
  onAddCard: (listaId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteList: (id: string) => void;
}

export const KanbanList = ({ lista, onAddCard, onEditCard, onDeleteList }: KanbanListProps) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(lista.id);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="flex-shrink-0 w-[280px] bg-muted/30 rounded-lg p-3 flex flex-col max-h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <h3 className="flex-1 font-semibold text-sm">
          {lista.titulo}
          <span className="ml-2 text-xs text-muted-foreground">
            {lista.cards?.length || 0}
          </span>
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
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

      {/* Cards */}
      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        <SortableContext
          items={(lista.cards || []).map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {lista.cards?.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Card */}
      <div className="mt-2">
        {isAddingCard ? (
          <div className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCard();
                if (e.key === 'Escape') setIsAddingCard(false);
              }}
              placeholder="Título do card"
              autoFocus
              className="h-9"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddCard}
                className="flex-1"
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
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingCard(true)}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Adicionar card
          </Button>
        )}
      </div>
    </div>
  );
};
