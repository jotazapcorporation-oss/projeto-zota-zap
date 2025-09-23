
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) return 'R$ 0,00'
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}

export const parseCurrency = (value: string): number => {
  // Remove caracteres não numéricos, exceto vírgula e ponto
  const cleaned = value.replace(/[^\d,-]/g, '')
  // Substitui vírgula por ponto para conversão
  const normalized = cleaned.replace(',', '.')
  return parseFloat(normalized) || 0
}

export const formatCurrencyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  // Converte para centavos
  const cents = parseInt(numbers)
  const reais = cents / 100
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais)
}
