-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for tasks
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  local TEXT,
  horario TIME,
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('urgente', 'fazer_depois', 'normal')),
  concluida BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  subtarefas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tasks" 
ON public.tarefas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.tarefas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.tarefas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.tarefas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tarefas_updated_at
BEFORE UPDATE ON public.tarefas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();