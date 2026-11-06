-- La opción "Filtro UV" pasa a llamarse "Transitions" en los tratamientos.
-- Se actualizan también las historias ya guardadas para que la impresión
-- y la vista clínica muestren el nuevo nombre.
UPDATE "historias_clinicas"
SET
  "tratamientosRecomendados" = array_replace("tratamientosRecomendados", 'Filtro UV', 'Transitions'),
  "updatedAt" = NOW()
WHERE 'Filtro UV' = ANY("tratamientosRecomendados");
