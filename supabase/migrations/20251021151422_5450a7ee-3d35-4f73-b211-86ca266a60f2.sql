-- Resetar contador de slots_utilizados para refletir a realidade
-- Como não há nenhum profile com master_id, o contador deve ser 0

UPDATE family_plan
SET slots_utilizados = (
  SELECT COUNT(*)
  FROM profiles
  WHERE profiles.master_id = family_plan.master_id
);