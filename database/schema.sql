CREATE DATABASE sistema_riego;

USE sistema_riego;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zonas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_cultivo VARCHAR(80) NOT NULL,
    superficie DECIMAL(10,2),
    ubicacion VARCHAR(150),
    estado ENUM('activa', 'inactiva') DEFAULT 'activa',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE umbrales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL UNIQUE,
    humedad_minima DECIMAL(5,2) NOT NULL,
    humedad_maxima DECIMAL(5,2) NOT NULL,
    CONSTRAINT fk_umbrales_zona
        FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

CREATE TABLE sensores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL,
    tipo ENUM('humedad', 'flujo') NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    CONSTRAINT fk_sensores_zona
        FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

CREATE TABLE valvulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('abierta', 'cerrada') DEFAULT 'cerrada',
    CONSTRAINT fk_valvulas_zona
        FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL,
    hora_inicio TIME NOT NULL,
    duracion_minutos INT NOT NULL,
    dias_semana VARCHAR(50) NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    CONSTRAINT fk_horarios_zona
        FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

CREATE TABLE lecturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lecturas_sensor
        FOREIGN KEY (sensor_id) REFERENCES sensores(id),
    INDEX idx_lecturas_fecha (fecha_hora),
    INDEX idx_lecturas_sensor_fecha (sensor_id, fecha_hora)
);

CREATE TABLE clima (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperatura DECIMAL(5,2) NOT NULL,
    probabilidad_lluvia DECIMAL(5,2) NOT NULL,
    lluvia_prevista BOOLEAN DEFAULT FALSE,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clima_fecha (fecha_hora)
);

CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL,
    valvula_id INT,
    tipo ENUM(
        'apertura',
        'cierre',
        'suspension_climatica',
        'riego_manual',
        'riego_automatico'
    ) NOT NULL,
    descripcion TEXT,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eventos_zona
        FOREIGN KEY (zona_id) REFERENCES zonas(id),
    CONSTRAINT fk_eventos_valvula
        FOREIGN KEY (valvula_id) REFERENCES valvulas(id),
    INDEX idx_eventos_fecha (fecha_hora)
);

CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL,
    tipo ENUM(
        'fuga',
        'valvula_atascada',
        'sobre_riego',
        'riego_insuficiente',
        'sensor_inactivo'
    ) NOT NULL,
    descripcion TEXT NOT NULL,
    nivel ENUM('bajo', 'medio', 'alto') DEFAULT 'medio',
    estado ENUM('activa', 'resuelta') DEFAULT 'activa',
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alertas_zona
        FOREIGN KEY (zona_id) REFERENCES zonas(id),
    INDEX idx_alertas_estado (estado),
    INDEX idx_alertas_fecha (fecha_hora)
);

CREATE TABLE consumos_agua (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL,
    valvula_id INT NOT NULL,
    litros_consumidos DECIMAL(10,2) DEFAULT 0,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,
    estado ENUM('en_curso', 'finalizado') DEFAULT 'en_curso',

    CONSTRAINT fk_consumos_zona
        FOREIGN KEY (zona_id) REFERENCES zonas(id),

    CONSTRAINT fk_consumos_valvula
        FOREIGN KEY (valvula_id) REFERENCES valvulas(id),

    INDEX idx_consumos_zona_fecha (zona_id, fecha_inicio)
);

