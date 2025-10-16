import { useState, useMemo } from 'react';
import { Plus, Search, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { EnhancedCategoryForm } from '@/components/categories/EnhancedCategoryForm';
import { useSupabaseCategories, Category } from '@/hooks/useSupabaseCategories';
import { TutorialButton } from '@/components/ui/tutorial-button';
import { TutorialModal } from '@/components/ui/tutorial-modal';
import { useTutorial } from '@/hooks/useTutorial';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/layout/PageTransition';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Categorias() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { categories: rawCategories, isLoading, refetch } = useSupabaseCategories();
  const tutorial = useTutorial('categorias');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Categories already include all fields from the hook
  const categories = useMemo(() => {
    return (rawCategories || [])
      .map(cat => ({
        ...cat,
        tipo: cat.tipo || 'despesa',
      }))
      .sort((a, b) => a.display_order - b.display_order);
  }, [rawCategories]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           cat.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           cat.tags?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || cat.tipo === filterType;
      return matchesSearch && matchesType;
    });
  }, [categories, searchQuery, filterType]);

  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'userid' | 'display_order'>) => {
    try {
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categorias')
          .update({
            nome: categoryData.nome,
            tipo: categoryData.tipo,
            color: categoryData.color,
            icon: categoryData.icon,
            description: categoryData.description || null,
            tags: categoryData.tags || null,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: "Categoria atualizada!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Create
        const { error } = await supabase
          .from('categorias')
          .insert({
            nome: categoryData.nome,
            tipo: categoryData.tipo,
            color: categoryData.color,
            icon: categoryData.icon,
            description: categoryData.description || null,
            tags: categoryData.tags || null,
            display_order: categories.length,
            userid: (await supabase.auth.getUser()).data.user?.id,
          });

        if (error) throw error;

        toast({
          title: "Categoria criada!",
          description: "Nova categoria adicionada com sucesso.",
        });
      }

      refetch();
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: "Categoria excluída",
        description: "A categoria foi removida com sucesso.",
      });

      refetch();
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = filteredCategories.findIndex(cat => cat.id === active.id);
    const newIndex = filteredCategories.findIndex(cat => cat.id === over.id);

    const reordered = arrayMove(filteredCategories, oldIndex, newIndex);

    // Update display_order in database
    try {
      const updates = reordered.map((cat, index) => ({
        id: cat.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('categorias')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao reordenar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const categoryStats = useMemo(() => {
    const receitas = categories.filter(c => c.tipo === 'receita').length;
    const despesas = categories.filter(c => c.tipo === 'despesa').length;
    const investimentos = categories.filter(c => c.tipo === 'investimento').length;
    
    return { receitas, despesas, investimentos, total: categories.length };
  }, [categories]);

  if (isLoading) {
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

  return (
    <PageTransition
      title="Categorias"
      description="Organize suas transações com categorias personalizadas e coloridas"
      icon={Tag}
    >
      <div className="flex items-center justify-end gap-2 mb-4">
        <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
        <Button 
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }} 
          className="gap-2 h-12 px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Nova Categoria
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-4 text-center"
        >
          <p className="text-3xl font-bold text-primary">{categoryStats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-3xl font-bold text-green-600">{categoryStats.receitas}</p>
          <p className="text-xs text-muted-foreground mt-1">💚 Receitas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-red-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-3xl font-bold text-red-600">{categoryStats.despesas}</p>
          <p className="text-xs text-muted-foreground mt-1">❤️ Despesas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-3xl font-bold text-blue-600">{categoryStats.investimentos}</p>
          <p className="text-xs text-muted-foreground mt-1">💙 Investimentos</p>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
          placeholder="Pesquisar categorias..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px] h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="receita">💚 Receitas</SelectItem>
            <SelectItem value="despesa">❤️ Despesas</SelectItem>
            <SelectItem value="investimento">💙 Investimentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center space-y-6 max-w-md">
            <div className="text-8xl">📂</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Nenhuma categoria ainda</h3>
              <p className="text-muted-foreground mb-6">
                Crie sua primeira categoria para começar a organizar suas transações
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-purple-600"
              >
                <Plus className="h-5 w-5" />
                Criar Primeira Categoria
              </Button>
            </div>
          </div>
        </motion.div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma categoria encontrada com os filtros aplicados
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredCategories.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <CategoryCard
                      category={category}
                      onEdit={() => {
                        setEditingCategory(category);
                        setIsFormOpen(true);
                      }}
                      onDelete={() => setDeleteId(category.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <EnhancedCategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={tutorial.isOpen}
        onClose={() => tutorial.setIsOpen(false)}
        sectionId="categorias"
        progress={tutorial.progress}
        onToggleStep={tutorial.toggleStep}
        onReset={tutorial.resetProgress}
      />
    </PageTransition>
  );
}
