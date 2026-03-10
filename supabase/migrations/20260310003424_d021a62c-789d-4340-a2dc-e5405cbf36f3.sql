
CREATE OR REPLACE FUNCTION public.depositar_caixinha(_caixinha_id uuid, _valor numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  _valor_atual_caixinha NUMERIC;
BEGIN
  IF _valor <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser positivo';
  END IF;

  SELECT valor_atual INTO _valor_atual_caixinha
  FROM public.caixinhas_poupanca
  WHERE id = _caixinha_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixinha não encontrada';
  END IF;

  UPDATE public.caixinhas_poupanca
  SET valor_atual = valor_atual + _valor,
      updated_at = now()
  WHERE id = _caixinha_id;

  RETURN jsonb_build_object(
    'success', true,
    'novo_valor_caixinha', _valor_atual_caixinha + _valor
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.retirar_caixinha(_caixinha_id uuid, _valor numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  _valor_atual_caixinha NUMERIC;
BEGIN
  IF _valor <= 0 THEN
    RAISE EXCEPTION 'O valor deve ser positivo';
  END IF;

  SELECT valor_atual INTO _valor_atual_caixinha
  FROM public.caixinhas_poupanca
  WHERE id = _caixinha_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixinha não encontrada';
  END IF;

  IF _valor_atual_caixinha < _valor THEN
    RAISE EXCEPTION 'Valor insuficiente na caixinha. Disponível: R$ %', _valor_atual_caixinha;
  END IF;

  UPDATE public.caixinhas_poupanca
  SET valor_atual = valor_atual - _valor,
      updated_at = now()
  WHERE id = _caixinha_id;

  RETURN jsonb_build_object(
    'success', true,
    'novo_valor_caixinha', _valor_atual_caixinha - _valor
  );
END;
$function$;
