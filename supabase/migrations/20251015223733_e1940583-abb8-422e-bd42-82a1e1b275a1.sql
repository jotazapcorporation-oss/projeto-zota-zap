-- Tabela de comentários nos cards
CREATE TABLE IF NOT EXISTS public.card_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de anexos (links para Supabase Storage)
CREATE TABLE IF NOT EXISTS public.card_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de membros atribuídos aos cards
CREATE TABLE IF NOT EXISTS public.card_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid NOT NULL,
  UNIQUE(card_id, user_id)
);

-- Tabela de log de atividades
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar campos de data ao card para start_date e reminder
ALTER TABLE public.cards 
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS reminder_days integer DEFAULT 1;

-- Enable RLS
ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies para card_comments
CREATE POLICY "Users can view comments from their cards"
  ON public.card_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_comments.card_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments in their cards"
  ON public.card_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_comments.card_id AND boards.user_id = auth.uid()
    ) AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own comments"
  ON public.card_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.card_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para card_attachments
CREATE POLICY "Users can view attachments from their cards"
  ON public.card_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_attachments.card_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload attachments to their cards"
  ON public.card_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_attachments.card_id AND boards.user_id = auth.uid()
    ) AND auth.uid() = uploaded_by
  );

CREATE POLICY "Users can delete attachments from their cards"
  ON public.card_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_attachments.card_id AND boards.user_id = auth.uid()
    )
  );

-- RLS Policies para card_members
CREATE POLICY "Users can view members from their cards"
  ON public.card_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_members.card_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can assign members to their cards"
  ON public.card_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_members.card_id AND boards.user_id = auth.uid()
    ) AND auth.uid() = assigned_by
  );

CREATE POLICY "Users can remove members from their cards"
  ON public.card_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public."Trello" ON cards.lista_id = "Trello".id
      JOIN public.boards ON "Trello".board_id = boards.id
      WHERE cards.id = card_members.card_id AND boards.user_id = auth.uid()
    )
  );

-- RLS Policies para activity_log
CREATE POLICY "Users can view their own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at em comments
CREATE OR REPLACE FUNCTION public.update_card_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_card_comments_updated_at
  BEFORE UPDATE ON public.card_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_card_comment_timestamp();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_card_comments_card_id ON public.card_comments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_card_id ON public.card_attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_members_card_id ON public.card_members(card_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_target ON public.activity_log(target_type, target_id);