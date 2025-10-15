
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { useReports } from '@/hooks/useReports'
import { useAuth } from '@/hooks/useLocalAuth'
import { ReportFiltersComponent } from '@/components/reports/ReportFilters'
import { ReportSummary } from '@/components/reports/ReportSummary'
import { ReportTable } from '@/components/reports/ReportTable'
import { ReportChart } from '@/components/reports/ReportChart'
import { PDFExportOptions as PDFOptions } from '@/components/reports/PDFExportOptions'
import { ExportButtons } from '@/components/reports/ExportButtons'
import { toast } from '@/hooks/use-toast'
import { generatePDFReport } from '@/utils/pdfGenerator'
import { generateExcelReport } from '@/utils/excelGenerator'
import { TutorialButton } from '@/components/ui/tutorial-button'
import { TutorialModal } from '@/components/ui/tutorial-modal'
import { useTutorial } from '@/hooks/useTutorial'
import { PageTransition } from '@/components/layout/PageTransition'

export default function Relatorios() {
  const { user } = useAuth()
  const { transactions, isLoading, filters, setFilters, summaryData } = useReports()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const tutorial = useTutorial('relatorios')

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      categoryId: '',
      period: 'month'
    })
  }

  const generatePDF = async (options: PDFOptions) => {
    if (transactions.length === 0) {
      toast({
        title: "Nenhuma transação encontrada",
        description: "Adicione transações antes de exportar o relatório.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingPDF(true)
    
    try {
      const reportData = {
        transactions,
        summaryData,
        filters,
        userName: user?.email || 'Usuário'
      }

      generatePDFReport(reportData, options)
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O relatório foi baixado para seu dispositivo.",
      })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao exportar o relatório.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const generateExcel = () => {
    if (transactions.length === 0) {
      toast({
        title: "Nenhuma transação encontrada",
        description: "Adicione transações antes de exportar o relatório.",
        variant: "destructive",
      })
      return
    }

    try {
      const reportData = {
        transactions,
        summaryData,
        filters,
        userName: user?.email || 'Usuário'
      }

      generateExcelReport(reportData)
      
      toast({
        title: "Excel gerado com sucesso!",
        description: "O relatório foi baixado para seu dispositivo.",
      })
    } catch (error) {
      console.error('Erro ao gerar Excel:', error)
      toast({
        title: "Erro ao gerar Excel",
        description: "Ocorreu um erro ao exportar o relatório.",
        variant: "destructive",
      })
    }
  }

  const getPeriodLabel = () => {
    switch (filters.period) {
      case 'day':
        return 'Hoje'
      case 'month':
        return 'Este Mês'
      case 'year':
        return 'Este Ano'
      case 'custom':
        return filters.startDate && filters.endDate 
          ? `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`
          : 'Período Personalizado'
      default:
        return 'Todos os Períodos'
    }
  }

  return (
    <PageTransition
      title="Relatórios Financeiros"
      description="Análises personalizadas e detalhadas das suas transações"
      icon={FileText}
    >
      <div className="flex justify-end gap-2 mb-4">
        <TutorialButton onClick={() => tutorial.setIsOpen(true)} />
        <ExportButtons
          onExportPDF={generatePDF}
          onExportExcel={generateExcel}
          isGeneratingPDF={isGeneratingPDF}
          disabled={transactions.length === 0}
        />
      </div>

      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo do Período: {getPeriodLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReportSummary
                receitas={summaryData.receitas}
                despesas={summaryData.despesas}
                saldo={summaryData.saldo}
                totalTransactions={summaryData.totalTransactions}
              />
            </CardContent>
          </Card>

          {transactions.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Análises Visuais Detalhadas</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Visualize seus dados financeiros através de múltiplas perspectivas
                  </p>
                </CardHeader>
                <CardContent>
                  <ReportChart
                    chartData={summaryData.chartData}
                    categoryData={summaryData.byCategory}
                  />
                </CardContent>
              </Card>

              <ReportTable transactions={transactions} />
            </>
          )}

          {transactions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Nenhuma transação encontrada para o período selecionado.
                </p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros acima para visualizar diferentes períodos ou categorias.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <TutorialModal
        isOpen={tutorial.isOpen}
        onClose={() => tutorial.setIsOpen(false)}
        sectionId="relatorios"
        progress={tutorial.progress}
        onToggleStep={tutorial.toggleStep}
        onReset={tutorial.resetProgress}
      />
    </PageTransition>
  )
}
