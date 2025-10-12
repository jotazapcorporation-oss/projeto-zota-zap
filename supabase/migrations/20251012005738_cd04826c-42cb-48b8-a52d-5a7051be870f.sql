-- Criar tabela de caixinhas de poupança
CREATE TABLE public.caixinhas_poupanca (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome_caixinha TEXT NOT NULL,
  valor_meta NUMERIC(10, 2) NOT NULL CHECK (valor_meta > 0),
  valor_atual NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (valor_atual >= 0),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.caixinhas_poupanca ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own caixinhas"
ON public.caixinhas_poupanca
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own caixinhas"
ON public.caixinhas_poupanca
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own caixinhas"
ON public.caixinhas_poupanca
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own caixinhas"
ON public.caixinhas_poupanca
FOR DELETE
USING (auth.uid() = user_id);

-- Adicionar coluna saldo na tabela profiles (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'saldo'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN saldo NUMERIC(10, 2) DEFAULT 0.00;
  END IF;
END $$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_caixinhas_updated_at
BEFORE UPDATE ON public.caixinhas_poupanca
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Função para depositar na caixinha (atômica)
CREATE OR REPLACE FUNCTION public.depositar_caixinha(
  _caixinha_id UUID,
  _valor NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _saldo_atual NUMERIC;
  _valor_atual_caixinha NUMERIC;
BEGIN
  -- Verificar se o valor é positivo
  IF _valor <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser positivo';
  END IF;

  -- Obter user_id da caixinha
  SELECT user_id, valor_atual INTO _user_id, _valor_atual_caixinha
  FROM public.caixinhas_poupanca
  WHERE id = _caixinha_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixinha não encontrada';
  END IF;

  -- Obter saldo atual do usuário
  SELECT COALESCE(saldo, 0) INTO _saldo_atual
  FROM public.profiles
  WHERE id = _user_id;

  -- Verificar se há saldo suficiente
  IF _saldo_atual < _valor THEN
    RAISE EXCEPTION 'Saldo insuficiente. Saldo disponível: R$ %', _saldo_atual;
  END IF;

  -- Atualizar valor da caixinha (adicionar)
  UPDATE public.caixinhas_poupanca
  SET valor_atual = valor_atual + _valor,
      updated_at = now()
  WHERE id = _caixinha_id;

  -- Subtrair do saldo geral
  UPDATE public.profiles
  SET saldo = saldo - _valor,
      updated_at = now()
  WHERE id = _user_id;

  RETURN jsonb_build_object(
    'success', true,
    'novo_saldo', _saldo_atual - _valor,
    'novo_valor_caixinha', _valor_atual_caixinha + _valor
  );
END;
$$;

-- Função para retirar da caixinha (atômica)
CREATE OR REPLACE FUNCTION public.retirar_caixinha(
  _caixinha_id UUID,
  _valor NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _saldo_atual NUMERIC;
  _valor_atual_caixinha NUMERIC;
BEGIN
  -- Verificar se o valor é positivo
  IF _valor <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser positivo';
  END IF;

  -- Obter user_id e valor atual da caixinha
  SELECT user_id, valor_atual INTO _user_id, _valor_atual_caixinha
  FROM public.caixinhas_poupanca
  WHERE id = _caixinha_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixinha não encontrada';
  END IF;

  -- Verificar se há valor suficiente na caixinha
  IF _valor_atual_caixinha < _valor THEN
    RAISE EXCEPTION 'Valor insuficiente na caixinha. Disponível: R$ %', _valor_atual_caixinha;
  END IF;

  -- Obter saldo atual do usuário
  SELECT COALESCE(saldo, 0) INTO _saldo_atual
  FROM public.profiles
  WHERE id = _user_id;

  -- Atualizar valor da caixinha (subtrair)
  UPDATE public.caixinhas_poupanca
  SET valor_atual = valor_atual - _valor,
      updated_at = now()
  WHERE id = _caixinha_id;

  -- Adicionar ao saldo geral
  UPDATE public.profiles
  SET saldo = saldo + _valor,
      updated_at = now()
  WHERE id = _user_id;

  RETURN jsonb_build_object(
    'success', true,
    'novo_saldo', _saldo_atual + _valor,
    'novo_valor_caixinha', _valor_atual_caixinha - _valor
  );
END;
$$;