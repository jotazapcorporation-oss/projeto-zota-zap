
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { ReportTransaction } from '@/hooks/useReports'
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal'

interface ReportTableProps {
  transactions: ReportTransaction[]
}

export function ReportTable({ transactions }: ReportTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<ReportTransaction | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes das Transações</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada com os filtros aplicados.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Estabelecimento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  onClick={() => {
                    setSelectedTransaction(transaction)
                    setDetailModalOpen(true)
                  }}
                  className="cursor-pointer hover:bg-accent/50"
                >
                  <TableCell>{formatDate(transaction.quando || '')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.tipo?.toLowerCase() === 'receita' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      {transaction.estabelecimento || 'Sem estabelecimento'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.categorias?.nome || 'Sem categoria'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.tipo?.toLowerCase() === 'receita' ? 'default' : 'destructive'}>
                      {transaction.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.tipo?.toLowerCase() === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.tipo?.toLowerCase() === 'receita' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.valor || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </Card>
  )
}
