import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useLocalAuth';
import { useSupabaseBoards, Board, Card, Lista } from '@/hooks/useSupabaseBoards';
import { useSupabaseListas } from '@/hooks/useSupabaseListas';
import { useSupabaseCards } from '@/hooks/useSupabaseCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BoardModal } from '@/components/kanban/BoardModal';
import { CardModal } from '@/components/kanban/CardModal';
import { KanbanList } from '@/components/kanban/KanbanList';
import { Plus, ArrowLeft, Search, LayoutGrid } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
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

export default function Metas() {
  const { user } = useAuth();
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useSupabaseBoards(user?.id);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const { listas, loading: loadingListas, setListas, createLista, deleteLista, updateListasOrder } = useSupabaseListas(selectedBoard?.id || null);
  const { createCard, updateCard, deleteCard, moveCard } = useSupabaseCards();
  
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [newCardListaId, setNewCardListaId] = useState<string | null>(null);
  const [deleteListaId, setDeleteListaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Select first board on load
  useEffect(() => {
    if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0]);
    }
  }, [boards, selectedBoard]);

  const handleCreateBoard = async (boardData: Partial<Board>) => {
    const newBoard = await createBoard(boardData as any);
    if (newBoard) {
      setSelectedBoard(newBoard);
    }
  };

  const handleAddCard = (listaId: string) => {
    setNewCardListaId(listaId);
    setEditingCard(null);
    setCardModalOpen(true);
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setNewCardListaId(null);
    setCardModalOpen(true);
  };

  const handleSaveCard = async (cardData: Partial<Card>) => {
    if (editingCard) {
      await updateCard(editingCard.id, cardData);
      
      // Update local state
      setListas(listas.map(lista => ({
        ...lista,
        cards: lista.cards.map(card =>
          card.id === editingCard.id ? { ...card, ...cardData } : card
        ),
      })));
    } else if (newCardListaId) {
      const newCard = await createCard(newCardListaId, {
        ...cardData,
        display_order: listas.find(l => l.id === newCardListaId)?.cards.length || 0,
      } as any);

      if (newCard) {
        // Update local state
        setListas(listas.map(lista =>
          lista.id === newCardListaId
            ? { ...lista, cards: [...lista.cards, newCard] }
            : lista
        ));
      }
    }
  };

  const handleDeleteLista = async (id: string) => {
    setDeleteListaId(id);
  };

  const handleConfirmDeleteLista = async () => {
    if (deleteListaId) {
      await deleteLista(deleteListaId);
      setDeleteListaId(null);
    }
  };

  const handleAddLista = async () => {
    if (!selectedBoard) return;
    
    const titulo = prompt('Nome da lista:');
    if (titulo) {
      await createLista(titulo.trim());
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging a card
    const activeCard = listas.flatMap(l => l.cards).find(c => c.id === activeId);
    if (!activeCard) return;

    const activeListaId = activeCard.lista_id;
    const overListaId = listas.find(l => l.id === overId)?.id || 
                        listas.flatMap(l => l.cards).find(c => c.id === overId)?.lista_id;

    if (!overListaId || activeListaId === overListaId) return;

    setListas(prev => {
      const activeLista = prev.find(l => l.id === activeListaId);
      const overLista = prev.find(l => l.id === overListaId);

      if (!activeLista || !overLista) return prev;

      const activeCards = activeLista.cards;
      const overCards = overLista.cards;
      const activeIndex = activeCards.findIndex(c => c.id === activeId);

      const newActiveLista = {
        ...activeLista,
        cards: activeCards.filter(c => c.id !== activeId),
      };

      const newOverLista = {
        ...overLista,
        cards: [...overCards, { ...activeCard, lista_id: overListaId }],
      };

      return prev.map(lista => {
        if (lista.id === activeListaId) return newActiveLista;
        if (lista.id === overListaId) return newOverLista;
        return lista;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging a list
    const activeListaIndex = listas.findIndex(l => l.id === activeId);
    if (activeListaIndex !== -1) {
      const overListaIndex = listas.findIndex(l => l.id === overId);
      if (overListaIndex !== -1) {
        const newListas = arrayMove(listas, activeListaIndex, overListaIndex);
        await updateListasOrder(newListas);
        return;
      }
    }

    // Dragging a card
    const activeCard = listas.flatMap(l => l.cards).find(c => c.id === activeId);
    if (!activeCard) return;

    const overCard = listas.flatMap(l => l.cards).find(c => c.id === overId);
    const newListaId = overCard?.lista_id || listas.find(l => l.id === overId)?.id;

    if (!newListaId) return;

    const newLista = listas.find(l => l.id === newListaId);
    if (!newLista) return;

    const newOrder = overCard 
      ? newLista.cards.findIndex(c => c.id === overId)
      : newLista.cards.length;

    await moveCard(activeId, newListaId, newOrder);

    // Reorder cards in the lista
    const updatedCards = newLista.cards.map((card, index) => ({
      ...card,
      display_order: index,
    }));

    for (const card of updatedCards) {
      await updateCard(card.id, { display_order: card.display_order });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando quadros...</p>
        </div>
      </div>
    );
  }

  if (!selectedBoard) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutGrid className="h-8 w-8 text-primary" />
              Meus Quadros
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize suas metas e projetos de forma visual
            </p>
          </div>
          <Button onClick={() => setBoardModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Quadro
          </Button>
        </div>

        {boards.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <LayoutGrid className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Nenhum quadro ainda</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Crie seu primeiro quadro para começar a organizar suas metas
                </p>
              </div>
              <Button onClick={() => setBoardModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Quadro
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board)}
                className="group p-6 rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg text-left bg-gradient-to-br from-card to-card/50"
              >
                <div className="text-4xl mb-3">{board.icone}</div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {board.titulo}
                </h3>
                {board.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {board.descricao}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        <BoardModal
          open={boardModalOpen}
          onClose={() => setBoardModalOpen(false)}
          onSave={handleCreateBoard}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedBoard(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedBoard.icone}</span>
            <h1 className="text-2xl font-bold">{selectedBoard.titulo}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cards..."
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={handleAddLista} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Lista
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {loadingListas ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : listas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Nenhuma lista ainda</p>
              <Button onClick={handleAddLista} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Criar primeira lista
              </Button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full pb-4">
              <SortableContext
                items={listas.map(l => l.id)}
                strategy={horizontalListSortingStrategy}
              >
                {listas.map((lista) => (
                  <KanbanList
                    key={lista.id}
                    lista={lista}
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
                    onDeleteList={handleDeleteLista}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-card rounded-lg border shadow-lg p-3 w-[280px]">
                  Movendo...
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <BoardModal
        open={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        onSave={handleCreateBoard}
      />

      <CardModal
        open={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setEditingCard(null);
          setNewCardListaId(null);
        }}
        onSave={handleSaveCard}
        card={editingCard}
      />

      <AlertDialog open={!!deleteListaId} onOpenChange={() => setDeleteListaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lista</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta lista? Todos os cards serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteLista} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
