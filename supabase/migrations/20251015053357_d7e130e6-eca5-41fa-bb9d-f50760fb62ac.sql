-- Add new columns to categorias table for enhanced UI
ALTER TABLE public.categorias 
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366F1',
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📁',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing categories with default values if they don't have them
UPDATE public.categorias 
SET 
  color = CASE 
    WHEN tipo = 'receita' THEN '#10B981'
    WHEN tipo = 'despesa' THEN '#EF4444'
    ELSE '#6366F1'
  END,
  icon = CASE 
    WHEN tipo = 'receita' THEN '💰'
    WHEN tipo = 'despesa' THEN '💸'
    ELSE '📁'
  END
WHERE color IS NULL OR icon IS NULL;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_categorias_display_order ON public.categorias(userid, display_order);