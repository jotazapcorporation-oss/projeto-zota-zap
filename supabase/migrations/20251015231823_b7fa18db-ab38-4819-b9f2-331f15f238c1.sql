-- Criar tabela fraseDiaria
CREATE TABLE public.fraseDiaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem text NOT NULL,
  autor text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fraseDiaria ENABLE ROW LEVEL SECURITY;

-- Permitir que todos os usuários autenticados leiam as frases
CREATE POLICY "Authenticated users can read phrases"
ON public.fraseDiaria
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Inserir algumas frases iniciais
INSERT INTO public.fraseDiaria (mensagem, autor) VALUES
('Sempre registre suas despesas no mesmo dia para não esquecer', 'Dica Financeira'),
('Defina metas mensais de economia e acompanhe seu progresso', 'Gestão Inteligente'),
('Categorize suas despesas para identificar onde gasta mais', 'Organização'),
('Configure lembretes para não perder datas de pagamento', 'Planejamento'),
('Revise seus gastos semanalmente para manter o controle', 'Disciplina Financeira'),
('Separe uma quantia fixa para emergências todo mês', 'Segurança Financeira');