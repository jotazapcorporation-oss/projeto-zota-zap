-- Adicionar foreign key constraint na tabela transacoes
-- para garantir integridade referencial com categorias
-- e excluir transações automaticamente quando a categoria for excluída

ALTER TABLE public.transacoes
ADD CONSTRAINT fk_transacoes_categoria
FOREIGN KEY (category_id)
REFERENCES public.categorias(id)
ON DELETE CASCADE;

-- Adicionar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_transacoes_category_id 
ON public.transacoes(category_id);