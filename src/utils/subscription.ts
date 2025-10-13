import type { SubscriptionData, ExternalSubscriptionData } from '@/types/subscription'

export const fetchUserSubscriptionId = async (userId: string): Promise<string | null> => {
  // Return demo subscription data for local system
  return 'demo-subscription-id'
}

export const fetchSubscriptionInfoWithJWT = async (): Promise<ExternalSubscriptionData> => {
  // Return demo external subscription data for local system
  return {
    id: 'demo-external-subscription',
    dataAssinatura: new Date().toISOString(),
    valor: 97.00,
    ciclo: 'monthly',
    status: 'ACTIVE',
    proimoPagamento: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
    creditCard: {
      creditCardNumber: '**** **** **** 1234',
      creditCardBrand: 'visa',
      creditCardToken: 'demo-token'
    }
  }
}

export const fetchSubscriptionInfo = async (userId: string): Promise<ExternalSubscriptionData | null> => {
  try {
    const credentials = btoa('USUARIO:SENHA');
    
    const response = await fetch('https://webhook.jzap.net/webhook/assinatura/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        userId: userId
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar informações da assinatura');
    }

    const data: ExternalSubscriptionData = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na busca das informações de assinatura:', error);
    throw new Error('Não foi possível carregar as informações da assinatura');
  }
}

export const mapSubscriptionData = (apiData: ExternalSubscriptionData): SubscriptionData => {
  return {
    id: apiData.id,
    user_id: '',
    subscription_id: apiData.id,
    status: apiData.status ? apiData.status.toLowerCase() as 'active' | 'inactive' | 'cancelled' | 'suspended' : 'inactive',
    plan_name: 'Plano Mensal',
    amount: apiData.valor,
    currency: 'BRL',
    cycle: apiData.ciclo,
    start_date: apiData.dataAssinatura,
    next_payment_date: apiData.proimoPagamento,
    payment_method: 'credit_card',
    card_last_four: apiData.creditCard.creditCardNumber.slice(-4),
    card_brand: apiData.creditCard.creditCardBrand,
    created_at: apiData.dataAssinatura,
    updated_at: new Date().toISOString()
  };
}

export const fetchLocalSubscriptionData = async (userId: string): Promise<SubscriptionData> => {
  // Return demo subscription data
  return {
    id: 'demo-subscription-id',
    user_id: userId,
    subscription_id: 'demo-external-subscription',
    status: 'active',
    plan_name: 'Plano Mensal',
    amount: 19.90,
    currency: 'BRL',
    cycle: 'monthly',
    start_date: new Date().toISOString(),
    next_payment_date: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
    payment_method: 'credit_card',
    card_last_four: '1234',
    card_brand: 'visa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export const syncSubscriptionData = async (): Promise<void> => {
  // Simulate sync operation for local system
  await new Promise(resolve => setTimeout(resolve, 1000))
}

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Não informado'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export const formatCurrency = (value: number | null): string => {
  if (!value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const getCycleLabel = (cycle: string | null): string => {
  if (!cycle) return 'Não informado'
  switch (cycle.toLowerCase()) {
    case 'monthly':
      return 'Plano Mensal'
    case 'yearly':
      return 'Plano Anual'
    case 'quarterly':
      return 'Plano Trimestral'
    default:
      return cycle
  }
}