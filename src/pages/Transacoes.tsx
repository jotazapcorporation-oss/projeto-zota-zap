
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from '@/components/ui/currency-input'
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { CategorySelectorWithCreate } from '@/components/transactions/CategorySelectorWithCreate'
import { useAuth } from '@/hooks/useLocalAuth'
import { useCategories } from '@/hooks/useLocalCategories'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { TutorialButton } from '@/components/ui/tutorial-button'
import { TutorialModal } from '@/components/ui/tutorial-modal'
import { useTutorial } from '@/hooks/useTutorial'
import { PageTransition } from '@/components/layout/PageTransition'

interface Transacao {
  id: number
  created_at: string
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  detalhes: string | null
  tipo: string | null
  category_id: string
  userid: string | null
  categorias?: {
    id: string
    nome: string
  }
}

export default function Transacoes() {
  const { user } = useAuth()
  const { categories } = useCategories()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  const tutorial = useTutorial('transacoes')
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [formData, setFormData] = useState({
    quando: '',
    estabelecimento: '',
    valor: 0,
    detalhes: '',
    tipo: '',
    category_id: '',
  })

  useEffect(() => {
    if (user) {
      fetchTransacoes()
    }
  }, [user])

  // Transações filtradas
  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(transacao => {
      const matchesSearch = !searchTerm || 
        (transacao.estabelecimento?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesType = !typeFilter || transacao.tipo === typeFilter
      const matchesCategory = !categoryFilter || transacao.category_id === categoryFilter
      
      return matchesSearch && matchesType && matchesCategory
    })
  }, [transacoes, searchTerm, typeFilter, categoryFilter])

  // Cálculo dos totais
  const { receitas, despesas, saldo } = useMemo(() => {
    const receitas = filteredTransacoes
      .filter(t => t.tipo?.toLowerCase() === 'receita')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const despesas = filteredTransacoes
      .filter(t => t.tipo?.toLowerCase() === 'despesa')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    return {
      receitas,
      despesas,
      saldo: receitas - despesas
    }
  }, [filteredTransacoes])

  const fetchTransacoes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('userid', user?.id as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTransacoes(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar transações',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setCategoryFilter('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação: categoria é obrigatória
    if (!formData.category_id) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione uma categoria para a transação.",
        variant: "destructive",
      })
      return
    }

    // A validação de categoria é feita pelas RLS policies do Supabase

    try {
      const transacaoData = {
        quando: formData.quando,
        estabelecimento: formData.estabelecimento,
        valor: formData.valor,
        detalhes: formData.detalhes,
        tipo: formData.tipo,
        category_id: formData.category_id,
        userid: user?.id,
      }

      if (editingTransaction) {
        const { error } = await supabase
          .from('transacoes')
          .update(transacaoData)
          .eq('id', editingTransaction.id)
          .eq('userid', user?.id)

        if (error) throw error

        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        })
      } else {
        const { error } = await supabase
          .from('transacoes')
          .insert([transacaoData])

        if (error) throw error

        toast({
          title: "Transação criada",
          description: "A transação foi criada com sucesso.",
        })
      }

      setDialogOpen(false)
      setEditingTransaction(null)
      setFormData({
        quando: '',
        estabelecimento: '',
        valor: 0,
        detalhes: '',
        tipo: '',
        category_id: '',
      })
      fetchTransacoes()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (transacao: Transacao) => {
    setEditingTransaction(transacao)
    setFormData({
      quando: transacao.quando || '',
      estabelecimento: transacao.estabelecimento || '',
      valor: transacao.valor || 0,
      detalhes: transacao.detalhes || '',
      tipo: transacao.tipo || '',
      category_id: transacao.category_id || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('userid', user?.id)

      if (error) throw error

      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      })
      
      fetchTransacoes()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteAll = async () => {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('userid', user?.id)

      if (error) throw error

      toast({
        title: "Transações excluídas",
        description: "Todas as transações foram excluídas com sucesso.",
      })
      
      fetchTransacoes()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transações",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <PageTransition
      title="Transações"
      description="Gerencie suas receitas e despesas"
      icon={CreditCard}
    >
      <div className="flex justify-end items-center gap-2 mb-4">
        <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
        {transacoes.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Todas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover todas as transações</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso irá remover permanentemente todas as suas transações.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Remover Todas
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction 
                  ? 'Faça as alterações necessárias na transação.' 
                  : 'Adicione uma nova receita ou despesa.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <CurrencyInput
                    value={formData.valor}
                    onChange={(value) => setFormData({...formData, valor: value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estabelecimento">Estabelecimento</Label>
                <Input
                  id="estabelecimento"
                  placeholder="Ex: Supermercado, Salário, etc."
                  value={formData.estabelecimento}
                  onChange={(e) => setFormData({...formData, estabelecimento: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <CategorySelectorWithCreate
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({...formData, category_id: value})}
                  transactionType={formData.tipo as 'receita' | 'despesa' | ''}
                  placeholder="Selecione a categoria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quando">Data</Label>
                <Input
                  id="quando"
                  type="date"
                  value={formData.quando}
                  onChange={(e) => setFormData({...formData, quando: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detalhes">Detalhes</Label>
                <Textarea
                  id="detalhes"
                  placeholder="Informações adicionais..."
                  value={formData.detalhes}
                  onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                {editingTransaction ? 'Atualizar' : 'Adicionar'} Transação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <TransactionSummaryCards
        receitas={receitas}
        despesas={despesas}
        saldo={saldo}
      />

      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onClearFilters={clearFilters}
      />

      <div className="grid gap-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTransacoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {transacoes.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação encontrada com os filtros aplicados'}
              </p>
              <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                Adicionar primeira transação
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTransacoes.map((transacao) => (
            <Card key={transacao.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {transacao.tipo?.toLowerCase() === 'receita' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-semibold">
                        {transacao.estabelecimento || 'Sem estabelecimento'}
                      </h3>
                      <Badge variant={transacao.tipo?.toLowerCase() === 'receita' ? 'default' : 'destructive'}>
                        {transacao.tipo?.toLowerCase() === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {transacao.categorias && (
                        <p>Categoria: {transacao.categorias.nome}</p>
                      )}
                      {transacao.quando && (
                        <p>Data: {formatDate(transacao.quando)}</p>
                      )}
                      {transacao.detalhes && (
                        <p>Detalhes: {transacao.detalhes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-xl font-bold ${
                      transacao.tipo?.toLowerCase() === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo?.toLowerCase() === 'receita' ? '+' : '-'}
                      {formatCurrency(Math.abs(transacao.valor || 0))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(transacao)}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(transacao.id)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TutorialModal
        isOpen={tutorial.isOpen}
        onClose={() => tutorial.setIsOpen(false)}
        sectionId="transacoes"
        progress={tutorial.progress}
        onToggleStep={tutorial.toggleStep}
        onReset={tutorial.resetProgress}
      />
    </PageTransition>
  )
}
