SELECT 
    z.id,
    z.nombre,
    u.humedad_minima,
    u.humedad_maxima
FROM zonas z
INNER JOIN umbrales u ON z.id = u.zona_id;

SELECT
    z.nombre AS zona,
    s.nombre AS sensor,
    s.tipo,
    s.estado
FROM zonas z
INNER JOIN sensores s ON z.id = s.zona_id;

SELECT
    z.nombre AS zona,
    v.nombre AS valvula,
    v.estado
FROM zonas z
INNER JOIN valvulas v ON z.id = v.zona_id;

SELECT
    h.id,
    z.nombre AS zona,
    h.hora_inicio,
    h.duracion_minutos,
    h.dias_semana,
    h.estado
FROM horarios h
INNER JOIN zonas z ON h.zona_id = z.id;

//----
SELECT
    z.id AS zona_id,
    z.nombre AS zona,
    z.tipo_cultivo,
    s.tipo AS tipo_sensor,
    l.valor AS ultima_lectura,
    l.fecha_hora
FROM zonas z
INNER JOIN sensores s ON z.id = s.zona_id
INNER JOIN lecturas l ON s.id = l.sensor_id
WHERE l.id = (
    SELECT MAX(l2.id)
    FROM lecturas l2
    WHERE l2.sensor_id = s.id
);
