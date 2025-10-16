-- Add priority column to cards table
ALTER TABLE public.cards 
ADD COLUMN priority text DEFAULT 'Baixa';