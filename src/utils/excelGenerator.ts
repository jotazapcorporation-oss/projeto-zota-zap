import * as XLSX from 'xlsx'
import { formatCurrency } from './currency'

interface Transaction {
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  tipo: string | null
  detalhes: string | null
  categorias?: {
    nome: string
  }
}

interface ExcelReportData {
  transactions: Transaction[]
  summaryData: {
    receitas: number
    despesas: number
    saldo: number
  }
  filters: {
    startDate?: string
    endDate?: string
    type?: string
    period?: string
  }
  userName: string
}

export function generateExcelReport(data: ExcelReportData) {
  const { transactions, summaryData, filters, userName } = data

  // Criar workbook
  const wb = XLSX.utils.book_new()

  // Preparar dados do resumo
  const summaryData_sheet = [
    ['RELATÓRIO FINANCEIRO - V-ZAP'],
    [''],
    ['Usuário:', userName],
    ['Data de Geração:', new Date().toLocaleString('pt-BR')],
    [''],
    ['RESUMO FINANCEIRO'],
    ['Receitas', formatCurrency(summaryData.receitas)],
    ['Despesas', formatCurrency(summaryData.despesas)],
    ['Saldo', formatCurrency(summaryData.saldo)],
    [''],
  ]

  // Adicionar informações de filtros se houver
  if (filters.startDate || filters.endDate) {
    summaryData_sheet.push(['PERÍODO'])
    if (filters.startDate) {
      summaryData_sheet.push(['Data Inicial', new Date(filters.startDate).toLocaleDateString('pt-BR')])
    }
    if (filters.endDate) {
      summaryData_sheet.push(['Data Final', new Date(filters.endDate).toLocaleDateString('pt-BR')])
    }
    summaryData_sheet.push([''])
  }

  // Criar aba de resumo
  const ws_summary = XLSX.utils.aoa_to_sheet(summaryData_sheet)
  XLSX.utils.book_append_sheet(wb, ws_summary, 'Resumo')

  // Preparar dados das transações
  const transactionsData = [
    ['TRANSAÇÕES DETALHADAS'],
    [''],
    ['Data', 'Estabelecimento', 'Categoria', 'Tipo', 'Valor', 'Detalhes']
  ]

  transactions.forEach(t => {
    transactionsData.push([
      t.quando ? new Date(t.quando).toLocaleDateString('pt-BR') : '',
      t.estabelecimento || '',
      t.categorias?.nome || 'Sem categoria',
      t.tipo?.toLowerCase() === 'receita' ? 'Receita' : 'Despesa',
      formatCurrency(t.valor || 0),
      t.detalhes || ''
    ])
  })

  // Adicionar totais ao final
  transactionsData.push(
    [''],
    ['', '', '', 'TOTAIS'],
    ['', '', '', 'Receitas:', formatCurrency(summaryData.receitas)],
    ['', '', '', 'Despesas:', formatCurrency(summaryData.despesas)],
    ['', '', '', 'Saldo:', formatCurrency(summaryData.saldo)]
  )

  // Criar aba de transações
  const ws_transactions = XLSX.utils.aoa_to_sheet(transactionsData)
  XLSX.utils.book_append_sheet(wb, ws_transactions, 'Transações')

  // Gerar arquivo
  const fileName = `relatorio_vzap_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}
