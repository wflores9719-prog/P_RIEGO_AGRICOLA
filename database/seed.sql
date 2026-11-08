
INSERT INTO zonas (nombre, descripcion, superficie, ubicacion)
VALUES
('Zona Norte', 'Área de cultivo ubicada al norte', 100.00, 'Norte'),
('Zona Sur', 'Área de cultivo ubicada al sur', 120.00, 'Sur'),
('Zona Este', 'Área de cultivo ubicada al este', 90.00, 'Este');

INSERT INTO umbrales (zona_id, humedad_minima, humedad_maxima)
VALUES
(1, 45.00, 70.00),
(2, 40.00, 65.00),
(3, 50.00, 75.00);

ALTER TABLE zonas
CHANGE COLUMN descripcion tipo_cultivo VARCHAR(80) NOT NULL;

UPDATE zonas
SET tipo_cultivo = 'Hortalizas'
WHERE id = 1;

UPDATE zonas
SET tipo_cultivo = 'Frutales'
WHERE id = 2;

UPDATE zonas
SET tipo_cultivo = 'Ornamentales'
WHERE id = 3;

INSERT INTO sensores (zona_id, tipo, nombre)
VALUES
(1, 'humedad', 'Sensor Humedad Norte'),
(1, 'flujo', 'Sensor Flujo Norte'),

(2, 'humedad', 'Sensor Humedad Sur'),
(2, 'flujo', 'Sensor Flujo Sur'),

(3, 'humedad', 'Sensor Humedad Este'),
(3, 'flujo', 'Sensor Flujo Este');

INSERT INTO valvulas (zona_id, nombre)
VALUES
(1, 'Valvula Norte'),
(2, 'Valvula Sur'),
(3, 'Valvula Este');

INSERT INTO horarios (
    zona_id,
    hora_inicio,
    duracion_minutos,
    dias_semana
)
VALUES
(1, '06:00:00', 10, 'Lunes,Miércoles,Viernes'),
(2, '07:00:00', 15, 'Martes,Jueves,Sábado'),
(3, '08:00:00', 8, 'Lunes,Miércoles,Viernes');

INSERT INTO lecturas (sensor_id, valor)
VALUES
(1, 38.50),
(3, 55.00),
(5, 42.00);

