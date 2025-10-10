-- Adicionar campo tipo às categorias
ALTER TABLE public.categorias
ADD COLUMN IF NOT EXISTS tipo text CHECK (tipo IN ('receita', 'despesa')) DEFAULT 'despesa';

-- Criar função para inserir categorias predefinidas para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir categorias de DESPESA
  INSERT INTO public.categorias (nome, tipo, tags, userid) VALUES
    ('Aluguel', 'despesa', 'moradia, fixo', NEW.id),
    ('Alimentação', 'despesa', 'comida, mercado, restaurante', NEW.id),
    ('Transporte', 'despesa', 'combustível, passagem, uber', NEW.id),
    ('Saúde', 'despesa', 'médico, farmácia, plano', NEW.id),
    ('Contas Fixas', 'despesa', 'água, luz, telefone, internet', NEW.id),
    ('Educação', 'despesa', 'escola, curso, livro', NEW.id),
    ('Lazer', 'despesa', 'entretenimento, hobby, viagem', NEW.id),
    ('Assinaturas', 'despesa', 'streaming, software, serviço', NEW.id),
    ('Impostos', 'despesa', 'iptu, ipva, ir', NEW.id),
    ('Vestuário', 'despesa', 'roupa, calçado, acessório', NEW.id),
    ('Manutenção', 'despesa', 'casa, carro, equipamento', NEW.id),
    ('Outros', 'despesa', 'diversas despesas', NEW.id);
  
  -- Inserir categorias de RECEITA
  INSERT INTO public.categorias (nome, tipo, tags, userid) VALUES
    ('Salário', 'receita', 'trabalho, mensal', NEW.id),
    ('Freelance', 'receita', 'autônomo, projeto', NEW.id),
    ('Investimentos', 'receita', 'renda, dividendo, juros', NEW.id),
    ('Vendas de Produtos', 'receita', 'comércio, mercadoria', NEW.id),
    ('Bônus', 'receita', 'premiação, gratificação', NEW.id),
    ('Aluguel Recebido', 'receita', 'imóvel, renda passiva', NEW.id),
    ('Reembolsos', 'receita', 'devolução, ressarcimento', NEW.id),
    ('Presentes', 'receita', 'doação, presente recebido', NEW.id),
    ('Prêmios', 'receita', 'loteria, sorteio, competição', NEW.id),
    ('Comissões', 'receita', 'venda, indicação', NEW.id),
    ('Outros', 'receita', 'diversas receitas', NEW.id);
  
  RETURN NEW;
END;
$$;

-- Criar trigger para inserir categorias ao criar novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();