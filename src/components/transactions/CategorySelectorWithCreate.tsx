import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories'
import { Plus } from 'lucide-react'

interface CategorySelectorWithCreateProps {
  value: string
  onValueChange: (value: string) => void
  transactionType: 'receita' | 'despesa' | ''
  placeholder?: string
}

export function CategorySelectorWithCreate({ 
  value, 
  onValueChange, 
  transactionType,
  placeholder = "Selecione a categoria" 
}: CategorySelectorWithCreateProps) {
  const { categories, isLoading, createCategory, isCreating } = useSupabaseCategories()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Filtrar categorias baseado no tipo de transação
  const filteredCategories = categories?.filter(cat => {
    if (!transactionType) return true
    return cat.tipo === transactionType
  }) || []

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !transactionType) return

    try {
      const newCategory = await createCategory({ 
        nome: newCategoryName.trim(), 
        tipo: transactionType as 'receita' | 'despesa'
      })
      
      if (newCategory) {
        onValueChange(newCategory.id)
        setNewCategoryName('')
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    }
  }

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando categorias..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (!transactionType) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Selecione primeiro o tipo de transação" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredCategories.map((categoria) => (
            <SelectItem key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Nova Categoria
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria de {transactionType === 'receita' ? 'Receita' : 'Despesa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCategory">Nome da Categoria</Label>
              <Input
                id="newCategory"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Alimentação, Salário..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreateCategory()
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setNewCategoryName('')
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || isCreating}
                className="flex-1"
              >
                {isCreating ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
