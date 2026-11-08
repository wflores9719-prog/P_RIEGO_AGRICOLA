const pool = require('../config/db');

// Consultar las condiciones climáticas más recientes
const obtenerClima = async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM clima
            ORDER BY fecha_hora DESC, id DESC
            LIMIT 1
        `;

        const [resultado] = await pool.query(sql);

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'No hay información climática registrada'
            });
        }

        res.json(resultado[0]);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Registrar nuevas condiciones climáticas simuladas
const actualizarClima = async (req, res) => {
    try {
        const {
            temperatura,
            probabilidad_lluvia,
            lluvia_prevista
        } = req.body;

        const temperaturaNum = Number(temperatura);
        const probabilidadNum = Number(probabilidad_lluvia);

        if (
            temperatura === undefined ||
            probabilidad_lluvia === undefined ||
            !Number.isFinite(temperaturaNum) ||
            !Number.isFinite(probabilidadNum) ||
            ![true, false, 0, 1].includes(lluvia_prevista)
        ) {
            return res.status(400).json({
                mensaje: 'Los datos climáticos son inválidos'
            });
        }

        if (
            temperaturaNum < -20 ||
            temperaturaNum > 60 ||
            probabilidadNum < 0 ||
            probabilidadNum > 100
        ) {
            return res.status(400).json({
                mensaje: 'Temperatura o probabilidad de lluvia fuera del rango permitido'
            });
        }

        const sql = `
            INSERT INTO clima
            (temperatura, probabilidad_lluvia, lluvia_prevista)
            VALUES (?, ?, ?)
        `;

        const [resultado] = await pool.query(sql, [
            temperaturaNum,
            probabilidadNum,
            lluvia_prevista
        ]);

        res.status(201).json({
            mensaje: 'Condiciones climáticas simuladas correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    obtenerClima,
    actualizarClima
};