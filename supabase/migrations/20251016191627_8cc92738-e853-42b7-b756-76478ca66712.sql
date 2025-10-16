-- Add end_time to agenda_eventos for event duration persistence
ALTER TABLE public.agenda_eventos
ADD COLUMN IF NOT EXISTS end_time time without time zone;

-- Optional: backfill existing rows with +1 hour default if end_time is null
UPDATE public.agenda_eventos
SET end_time = (event_time + interval '1 hour')::time
WHERE end_time IS NULL;