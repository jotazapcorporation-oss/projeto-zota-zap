-- Remover a constraint com CASCADE e adicionar nova sem CASCADE
-- para preservar as transações quando uma categoria for excluída

ALTER TABLE public.transacoes
DROP CONSTRAINT IF EXISTS fk_transacoes_categoria;

-- Adicionar nova constraint SEM CASCADE
-- Isso impedirá a exclusão de categorias que têm transações vinculadas
ALTER TABLE public.transacoes
ADD CONSTRAINT fk_transacoes_categoria
FOREIGN KEY (category_id)
REFERENCES public.categorias(id)
ON DELETE RESTRICT;

-- O índice já existe, não precisa recriar