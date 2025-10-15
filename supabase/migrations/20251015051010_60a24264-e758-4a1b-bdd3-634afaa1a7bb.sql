-- Create boards table
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT DEFAULT '📋',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lists table
CREATE TABLE public.listas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cards table
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lista_id UUID NOT NULL REFERENCES public.listas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_vencimento DATE,
  etiquetas JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Create policies for boards
CREATE POLICY "Users can view their own boards" 
ON public.boards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" 
ON public.boards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" 
ON public.boards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" 
ON public.boards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for listas
CREATE POLICY "Users can view lists from their boards" 
ON public.listas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.boards 
  WHERE boards.id = listas.board_id 
  AND boards.user_id = auth.uid()
));

CREATE POLICY "Users can create lists in their boards" 
ON public.listas 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.boards 
  WHERE boards.id = listas.board_id 
  AND boards.user_id = auth.uid()
));

CREATE POLICY "Users can update lists in their boards" 
ON public.listas 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.boards 
  WHERE boards.id = listas.board_id 
  AND boards.user_id = auth.uid()
));

CREATE POLICY "Users can delete lists from their boards" 
ON public.listas 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.boards 
  WHERE boards.id = listas.board_id 
  AND boards.user_id = auth.uid()
));

-- Create policies for cards
CREATE POLICY "Users can view cards from their lists" 
ON public.cards 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.listas 
  JOIN public.boards ON boards.id = listas.board_id
  WHERE listas.id = cards.lista_id 
  AND boards.user_id = auth.uid()
));

CREATE POLICY "Users can create cards in their lists" 
ON public.cards 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.listas 
  JOIN public.boards ON boards.id = listas.board_id
  WHERE listas.id = cards.lista_id 
  AND boards.user_id = auth.uid()
));

CREATE POLICY "Users can update cards in their lists" 
ON public.cards 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.listas 
  JOIN public.boards ON boards.id = listas.board_id
  WHERE listas.id = cards.lista_id 
  AND boards.user_id = auth.uid()
));

CREATE POLICY "Users can delete cards from their lists" 
ON public.cards 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.listas 
  JOIN public.boards ON boards.id = listas.board_id
  WHERE listas.id = cards.lista_id 
  AND boards.user_id = auth.uid()
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listas_updated_at
BEFORE UPDATE ON public.listas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();