import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useLocalAuth';
import { useSupabaseBoards, Board, Card, Lista } from '@/hooks/useSupabaseBoards';
import { useSupabaseListas } from '@/hooks/useSupabaseListas';
import { useSupabaseCards } from '@/hooks/useSupabaseCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnhancedBoardModal } from '@/components/kanban/EnhancedBoardModal';
import { CardModal } from '@/components/kanban/CardModal';
import { EnhancedKanbanList } from '@/components/kanban/EnhancedKanbanList';
import { BoardCard } from '@/components/kanban/BoardCard';
import { Plus, ArrowLeft, Search, Sparkles } from 'lucide-react';
import { TutorialButton } from '@/components/ui/tutorial-button';
import { TutorialModal } from '@/components/ui/tutorial-modal';
import { useTutorial } from '@/hooks/useTutorial';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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
  const tutorial = useTutorial('metas');
  
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [newCardListaId, setNewCardListaId] = useState<string | null>(null);
  const [deleteListaId, setDeleteListaId] = useState<string | null>(null);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!selectedBoard && boards.length > 0) {
      // Não selecionar automaticamente, ficar na tela inicial
    }
  }, [boards, selectedBoard]);

  const handleCreateBoard = async (boardData: Partial<Board>) => {
    if (!boardData.titulo) return;
    await createBoard({
      titulo: boardData.titulo,
      descricao: boardData.descricao,
      icone: boardData.icone || '📋',
      display_order: boardData.display_order || 0,
    });
    setBoardModalOpen(false);
  };

  const handleUpdateBoard = async (boardData: Partial<Board>) => {
    if (editingBoard && boardData.titulo) {
      await updateBoard(editingBoard.id, {
        titulo: boardData.titulo,
        descricao: boardData.descricao,
        icone: boardData.icone || '📋',
        display_order: boardData.display_order || 0,
      });
      if (selectedBoard?.id === editingBoard.id) {
        setSelectedBoard({ ...selectedBoard, ...boardData } as Board);
      }
      setEditingBoard(null);
      setBoardModalOpen(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (deleteBoardId) {
      await deleteBoard(deleteBoardId);
      if (selectedBoard?.id === deleteBoardId) {
        setSelectedBoard(null);
      }
      setDeleteBoardId(null);
    }
  };

  const handleAddCard = async (listaId: string, titulo: string) => {
    if (!titulo.trim()) return;
    await createCard(listaId, {
      titulo: titulo.trim(),
      descricao: '',
      data_vencimento: null,
      etiquetas: [],
      checklist: [],
      display_order: listas.find(l => l.id === listaId)?.cards?.length || 0,
    });
  };

  const handleUpdateListTitle = async (id: string, titulo: string) => {
    const listaToUpdate = listas.find(l => l.id === id);
    if (!listaToUpdate) return;
    
    // Update via Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase
      .from('listas')
      .update({ titulo })
      .eq('id', id);
    
    if (!error) {
      // Update local state
      setListas(listas.map(l => l.id === id ? { ...l, titulo } : l));
    }
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setCardModalOpen(true);
  };

  const handleSaveCard = async (cardData: Partial<Card>) => {
    if (editingCard && cardData.titulo) {
      const wasComplete = editingCard.checklist?.every(item => item.concluido) && editingCard.checklist?.length > 0;
      const nowComplete = cardData.checklist?.every(item => item.concluido) && cardData.checklist?.length > 0;
      
      await updateCard(editingCard.id, {
        titulo: cardData.titulo,
        descricao: cardData.descricao,
        data_vencimento: cardData.data_vencimento,
        etiquetas: cardData.etiquetas,
        checklist: cardData.checklist,
        display_order: cardData.display_order || 0,
      });
      
      // Confetti when completing all checklist items
      if (!wasComplete && nowComplete) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      setEditingCard(null);
    } else if (newCardListaId && cardData.titulo) {
      await createCard(newCardListaId, {
        titulo: cardData.titulo,
        descricao: cardData.descricao,
        data_vencimento: cardData.data_vencimento,
        etiquetas: cardData.etiquetas || [],
        checklist: cardData.checklist || [],
        display_order: listas.find(l => l.id === newCardListaId)?.cards?.length || 0,
      });
      setNewCardListaId(null);
    }
    setCardModalOpen(false);
  };

  const handleAddLista = async () => {
    if (!selectedBoard) return;
    const titulo = `Nova Lista ${(listas?.length || 0) + 1}`;
    await createLista(titulo);
  };

  const handleConfirmDeleteLista = async () => {
    if (!deleteListaId) return;
    await deleteLista(deleteListaId);
    setDeleteListaId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active card
    const activeCard = listas.flatMap(l => l.cards).find(c => c.id === activeId);
    if (!activeCard) return; // If not a card, it's a list, skip

    // Find which list the card is over
    let overListaId: string | undefined;
    const overCard = listas.flatMap(l => l.cards).find(c => c.id === overId);
    
    if (overCard) {
      overListaId = overCard.lista_id;
    } else {
      // Check if over is a list itself
      overListaId = listas.find(l => l.id === overId)?.id;
    }

    if (!overListaId || activeCard.lista_id === overListaId) return;

    // Move card between lists in local state for immediate feedback
    setListas(prevListas => {
      const sourceLista = prevListas.find(l => l.id === activeCard.lista_id);
      const destLista = prevListas.find(l => l.id === overListaId);
      
      if (!sourceLista || !destLista) return prevListas;

      const sourceCards = sourceLista.cards.filter(c => c.id !== activeId);
      const destCards = [...destLista.cards, { ...activeCard, lista_id: overListaId }];

      return prevListas.map(lista => {
        if (lista.id === sourceLista.id) {
          return { ...lista, cards: sourceCards };
        }
        if (lista.id === destLista.id) {
          return { ...lista, cards: destCards };
        }
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
    const activeList = listas.find(l => l.id === activeId);
    if (activeList) {
      const overList = listas.find(l => l.id === overId);
      if (overList) {
        const oldIndex = listas.findIndex(l => l.id === activeId);
        const newIndex = listas.findIndex(l => l.id === overId);
        const newListas = arrayMove(listas, oldIndex, newIndex);
        
        setListas(newListas);
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
  };

  const filteredBoards = boards.filter(board => 
    board.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular total de cards por board
  const getBoardTasksCount = (boardId: string) => {
    // Esta função será usada quando tivermos acesso aos dados
    return 0; // Placeholder
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!selectedBoard) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-primary" />
                Meus Quadros
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Organize suas metas e projetos de forma visual
              </p>
            </div>
            <div className="flex gap-2">
              <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
              <Button 
                onClick={() => {
                  setEditingBoard(null);
                  setBoardModalOpen(true);
                }} 
                className="gap-2 h-12 px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                Novo Quadro
              </Button>
            </div>
          </div>

          {/* Search */}
          {boards.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar quadros..."
                className="pl-10 h-11 bg-background/50 backdrop-blur-sm"
              />
            </div>
          )}
        </motion.div>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center space-y-6 max-w-md">
              <div className="text-8xl">📋</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Nenhum quadro ainda</h3>
                <p className="text-muted-foreground mb-6">
                  Crie seu primeiro quadro e comece a organizar suas metas de forma visual e intuitiva
                </p>
                <Button
                  onClick={() => setBoardModalOpen(true)}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-purple-600"
                >
                  <Plus className="h-5 w-5" />
                  Criar Primeiro Quadro
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBoards.map((board, index) => (
                <motion.div
                  key={board.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BoardCard
                    board={board}
                    tasksCount={getBoardTasksCount(board.id)}
                    onOpen={() => setSelectedBoard(board)}
                    onEdit={() => {
                      setEditingBoard(board);
                      setBoardModalOpen(true);
                    }}
                    onDelete={() => setDeleteBoardId(board.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modals */}
        <EnhancedBoardModal
          open={boardModalOpen}
          onClose={() => {
            setBoardModalOpen(false);
            setEditingBoard(null);
          }}
          onSave={editingBoard ? handleUpdateBoard : handleCreateBoard}
          board={editingBoard}
        />

        {/* Delete Board Dialog */}
        <AlertDialog open={!!deleteBoardId} onOpenChange={() => setDeleteBoardId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Quadro</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este quadro? Todas as listas e cards serão removidos. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBoard} className="bg-destructive hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <TutorialModal
          isOpen={tutorial.isOpen}
          onClose={() => tutorial.setIsOpen(false)}
          sectionId="metas"
          progress={tutorial.progress}
          onToggleStep={tutorial.toggleStep}
          onReset={tutorial.resetProgress}
        />
      </div>
    );
  }

  // Board View (Kanban)
  const totalTasks = listas.reduce((acc, lista) => acc + (lista.cards?.length || 0), 0);
  const completedTasks = listas.reduce((acc, lista) => 
    acc + (lista.cards?.filter(card => card.checklist?.every(item => item.concluido) && card.checklist.length > 0).length || 0), 0
  );
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBoard(null)}
                className="hover:bg-accent h-10 gap-2"
                aria-label="Voltar para Quadros"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar para Quadros
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <span className="text-5xl">{selectedBoard.icone}</span>
                  {selectedBoard.titulo}
                </h1>
                {selectedBoard.descricao && (
                  <p className="text-muted-foreground mt-1">{selectedBoard.descricao}</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddLista}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Lista
            </Button>
          </div>

          {/* Progress Bar */}
          {totalTasks > 0 && (
            <div className="mt-4 bg-card rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full"
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completedTasks} de {totalTasks} metas concluídas
              </p>
            </div>
          )}
        </motion.div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          {loadingListas ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
          ) : listas.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-6xl">📝</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Nenhuma lista ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie listas para organizar suas metas
                  </p>
                  <Button onClick={handleAddLista} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Lista
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 h-full">
              <SortableContext
                items={listas.map(l => l.id)}
                strategy={horizontalListSortingStrategy}
              >
                {listas.map((lista) => (
                  <EnhancedKanbanList
                    key={lista.id}
                    lista={lista}
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
                    onDeleteList={setDeleteListaId}
                    onUpdateListTitle={handleUpdateListTitle}
                  />
                ))}
              </SortableContext>
            </div>
          )}
        </div>

        {/* Modals */}
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

        <TutorialModal
          isOpen={tutorial.isOpen}
          onClose={() => tutorial.setIsOpen(false)}
          sectionId="metas"
          progress={tutorial.progress}
          onToggleStep={tutorial.toggleStep}
          onReset={tutorial.resetProgress}
        />
      </div>

      <DragOverlay>
        {activeId && listas.flatMap(l => l.cards).find(c => c.id === activeId) ? (
          <div className="opacity-50">Card sendo arrastado</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
