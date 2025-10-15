-- Adicionar campo cover_image aos cards
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS cover_image text;

-- Criar função para duplicar card
CREATE OR REPLACE FUNCTION public.duplicate_card(_card_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_card_id uuid;
  _original_card record;
  _comment record;
  _attachment record;
  _member record;
BEGIN
  -- Buscar card original
  SELECT * INTO _original_card FROM cards WHERE id = _card_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card não encontrado';
  END IF;
  
  -- Verificar permissão do usuário
  IF NOT EXISTS (
    SELECT 1 FROM cards c
    JOIN "Trello" t ON c.lista_id = t.id
    JOIN boards b ON t.board_id = b.id
    WHERE c.id = _card_id AND b.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Sem permissão para duplicar este card';
  END IF;
  
  -- Criar novo card
  INSERT INTO cards (
    lista_id, titulo, descricao, cover_image, data_vencimento,
    start_date, priority, etiquetas, checklist, display_order, reminder_days
  ) VALUES (
    _original_card.lista_id,
    _original_card.titulo || ' (Cópia)',
    _original_card.descricao,
    _original_card.cover_image,
    _original_card.data_vencimento,
    _original_card.start_date,
    'Baixa',
    _original_card.etiquetas,
    _original_card.checklist,
    _original_card.display_order + 1,
    _original_card.reminder_days
  ) RETURNING id INTO _new_card_id;
  
  -- Copiar comentários
  FOR _comment IN SELECT * FROM card_comments WHERE card_id = _card_id LOOP
    INSERT INTO card_comments (card_id, user_id, content)
    VALUES (_new_card_id, _comment.user_id, _comment.content);
  END LOOP;
  
  -- Copiar anexos
  FOR _attachment IN SELECT * FROM card_attachments WHERE card_id = _card_id LOOP
    INSERT INTO card_attachments (card_id, file_name, file_url, file_size, file_type, uploaded_by)
    VALUES (_new_card_id, _attachment.file_name, _attachment.file_url, _attachment.file_size, _attachment.file_type, auth.uid());
  END LOOP;
  
  -- Copiar membros
  FOR _member IN SELECT * FROM card_members WHERE card_id = _card_id LOOP
    INSERT INTO card_members (card_id, user_id, assigned_by)
    VALUES (_new_card_id, _member.user_id, auth.uid());
  END LOOP;
  
  -- Log da ação
  INSERT INTO activity_log (user_id, action, target_id, target_type, details)
  VALUES (auth.uid(), 'duplicated', _new_card_id, 'card', jsonb_build_object('original_card_id', _card_id));
  
  RETURN _new_card_id;
END;
$$;

-- Criar função para duplicar lista com todos os cards
CREATE OR REPLACE FUNCTION public.duplicate_lista(_lista_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_lista_id uuid;
  _original_lista record;
  _card record;
  _new_card_id uuid;
BEGIN
  -- Buscar lista original
  SELECT * INTO _original_lista FROM "Trello" WHERE id = _lista_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lista não encontrada';
  END IF;
  
  -- Verificar permissão
  IF NOT EXISTS (
    SELECT 1 FROM "Trello" t
    JOIN boards b ON t.board_id = b.id
    WHERE t.id = _lista_id AND b.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Sem permissão para duplicar esta lista';
  END IF;
  
  -- Criar nova lista
  INSERT INTO "Trello" (board_id, titulo, display_order)
  VALUES (
    _original_lista.board_id,
    _original_lista.titulo || ' (Cópia)',
    _original_lista.display_order + 1
  ) RETURNING id INTO _new_lista_id;
  
  -- Duplicar todos os cards da lista
  FOR _card IN SELECT * FROM cards WHERE lista_id = _lista_id ORDER BY display_order LOOP
    -- Criar novo card
    INSERT INTO cards (
      lista_id, titulo, descricao, cover_image, data_vencimento,
      start_date, priority, etiquetas, checklist, display_order, reminder_days
    ) VALUES (
      _new_lista_id,
      _card.titulo,
      _card.descricao,
      _card.cover_image,
      _card.data_vencimento,
      _card.start_date,
      _card.priority,
      _card.etiquetas,
      _card.checklist,
      _card.display_order,
      _card.reminder_days
    ) RETURNING id INTO _new_card_id;
  END LOOP;
  
  -- Log da ação
  INSERT INTO activity_log (user_id, action, target_id, target_type, details)
  VALUES (auth.uid(), 'duplicated', _new_lista_id, 'lista', jsonb_build_object('original_lista_id', _lista_id));
  
  RETURN _new_lista_id;
END;
$$;