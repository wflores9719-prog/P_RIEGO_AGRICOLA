const pool = require('../config/db');

// Consultar todos los sensores
const obtenerSensores = async (req, res) => {
    try {
        const sql = `
            SELECT
                s.id,
                s.zona_id,
                z.nombre AS zona,
                s.tipo,
                s.nombre,
                s.estado
            FROM sensores s
            INNER JOIN zonas z ON s.zona_id = z.id
            ORDER BY s.zona_id, s.id
        `;

        const [resultado] = await pool.query(sql);

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Consultar las últimas lecturas de los sensores
const obtenerLecturas = async (req, res) => {
    try {
        const sql = `
            SELECT
                s.id AS sensor_id,
                s.nombre AS sensor,
                s.tipo,
                z.nombre AS zona,
                l.valor,
                l.fecha_hora
            FROM sensores s
            INNER JOIN zonas z ON s.zona_id = z.id
            LEFT JOIN lecturas l ON l.id = (
                SELECT l2.id
                FROM lecturas l2
                WHERE l2.sensor_id = s.id
                ORDER BY l2.fecha_hora DESC, l2.id DESC
                LIMIT 1
            )
            ORDER BY s.zona_id, s.id
        `;

        const [resultado] = await pool.query(sql);

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Consultar historial de lecturas de un sensor
const obtenerHistorial = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT
                s.nombre AS sensor,
                s.tipo,
                l.valor,
                l.fecha_hora
            FROM lecturas l
            INNER JOIN sensores s ON l.sensor_id = s.id
            WHERE s.id = ?
            ORDER BY l.fecha_hora DESC
        `;

        const [resultado] = await pool.query(sql, [id]);

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    obtenerSensores,
    obtenerLecturas,
    obtenerHistorial
};