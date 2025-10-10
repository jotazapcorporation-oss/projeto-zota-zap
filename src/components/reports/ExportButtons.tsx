import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PDFExportOptions as PDFOptions } from '@/components/reports/PDFExportOptions'

interface ExportButtonsProps {
  onExportPDF: (options: PDFOptions) => void
  onExportExcel: () => void
  isGeneratingPDF: boolean
  disabled?: boolean
}

export function ExportButtons({ 
  onExportPDF, 
  onExportExcel, 
  isGeneratingPDF,
  disabled = false 
}: ExportButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPDFOptionsOpen, setIsPDFOptionsOpen] = useState(false)
  const [pdfOptions, setPdfOptions] = useState<PDFOptions>({
    transactionType: 'all',
    includeCharts: true,
    includeSummary: true,
    includeDetails: true
  })

  const handleExportPDF = () => {
    onExportPDF(pdfOptions)
    setIsPDFOptionsOpen(false)
    setIsDialogOpen(false)
  }

  const handleExportExcel = () => {
    onExportExcel()
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="gap-2">
          <FileDown className="h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Escolha o formato de exportação do seu relatório financeiro:
          </p>
          
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => setIsPDFOptionsOpen(true)}
              disabled={isGeneratingPDF}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Gerar PDF</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Relatório formatado e pronto para impressão
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={handleExportExcel}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                <span className="font-semibold">Gerar Excel</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Planilha completa com todas as transações
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Dialog de opções do PDF */}
      <Dialog open={isPDFOptionsOpen} onOpenChange={setIsPDFOptionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Opções do PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Transação</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={pdfOptions.transactionType}
                onChange={(e) => setPdfOptions({ ...pdfOptions, transactionType: e.target.value as any })}
              >
                <option value="all">Todas</option>
                <option value="receita">Apenas Receitas</option>
                <option value="despesa">Apenas Despesas</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeSummary}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, includeSummary: e.target.checked })}
                />
                <span className="text-sm">Incluir Resumo</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeDetails}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, includeDetails: e.target.checked })}
                />
                <span className="text-sm">Incluir Detalhes</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeCharts}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, includeCharts: e.target.checked })}
                />
                <span className="text-sm">Incluir Gráficos</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPDFOptionsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
                className="flex-1"
              >
                {isGeneratingPDF ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
