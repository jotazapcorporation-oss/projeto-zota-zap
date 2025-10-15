-- Adicionar coluna para armazenar a ordem personalizada dos campos do formulário de cards
ALTER TABLE public.profiles
ADD COLUMN card_form_field_order JSONB DEFAULT '["titulo", "descricao", "data_vencimento", "etiquetas", "checklist"]'::jsonb;

COMMENT ON COLUMN public.profiles.card_form_field_order IS 'Ordem personalizada dos campos no formulário de edição de cards';