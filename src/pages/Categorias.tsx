
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoriesList } from '@/components/categories/CategoriesList';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';

export default function Categorias() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { categories, isLoading } = useSupabaseCategories();

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize suas transações com categorias personalizadas
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <CategoriesList 
        categories={categories} 
        onEdit={handleEditCategory}
      />

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
