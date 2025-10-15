-- Corrigir search_path nas funções depositar_caixinha e retirar_caixinha
DROP FUNCTION IF EXISTS public.depositar_caixinha(_caixinha_id uuid, _valor numeric);
CREATE OR REPLACE FUNCTION public.depositar_caixinha(_caixinha_id uuid, _valor numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  _user_id UUID;
  _saldo_atual NUMERIC;
  _valor_atual_caixinha NUMERIC;
BEGIN
  IF _valor <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser positivo';
  END IF;

  SELECT user_id, valor_atual INTO _user_id, _valor_atual_caixinha
  FROM public.caixinhas_poupanca
  WHERE id = _caixinha_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixinha não encontrada';
  END IF;

  SELECT COALESCE(saldo, 0) INTO _saldo_atual
  FROM public.profiles
  WHERE id = _user_id;

  IF _saldo_atual < _valor THEN
    RAISE EXCEPTION 'Saldo insuficiente. Saldo disponível: R$ %', _saldo_atual;
  END IF;

  UPDATE public.caixinhas_poupanca
  SET valor_atual = valor_atual + _valor,
      updated_at = now()
  WHERE id = _caixinha_id;

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
$function$;

DROP FUNCTION IF EXISTS public.retirar_caixinha(_caixinha_id uuid, _valor numeric);
CREATE OR REPLACE FUNCTION public.retirar_caixinha(_caixinha_id uuid, _valor numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  _user_id UUID;
  _saldo_atual NUMERIC;
  _valor_atual_caixinha NUMERIC;
BEGIN
  IF _valor <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser positivo';
  END IF;

  SELECT user_id, valor_atual INTO _user_id, _valor_atual_caixinha
  FROM public.caixinhas_poupanca
  WHERE id = _caixinha_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixinha não encontrada';
  END IF;

  IF _valor_atual_caixinha < _valor THEN
    RAISE EXCEPTION 'Valor insuficiente na caixinha. Disponível: R$ %', _valor_atual_caixinha;
  END IF;

  SELECT COALESCE(saldo, 0) INTO _saldo_atual
  FROM public.profiles
  WHERE id = _user_id;

  UPDATE public.caixinhas_poupanca
  SET valor_atual = valor_atual - _valor,
      updated_at = now()
  WHERE id = _caixinha_id;

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
$function$;