
export interface SubscriptionData {
  id: string
  user_id: string
  subscription_id: string
  status: 'active' | 'inactive' | 'cancelled' | 'suspended'
  plan_name: string | null
  amount: number | null
  currency: string
  cycle: string | null
  start_date: string | null
  next_payment_date: string | null
  payment_method: string | null
  card_last_four: string | null
  card_brand: string | null
  created_at: string
  updated_at: string
}

export interface ExternalSubscriptionData {
  id: string
  dataAssinatura: string
  valor: number
  ciclo: string
  status: string
  proimoPagamento: string
  creditCard: {
    creditCardNumber: string
    creditCardBrand: string
    creditCardToken: string
  }
}
