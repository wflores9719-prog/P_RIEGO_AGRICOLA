const pool = require('../config/db');

// Consultar todos los umbrales
const obtenerUmbrales = async (req, res) => {
    try {
        const sql = `
            SELECT u.*, z.nombre AS zona
            FROM umbrales u
            INNER JOIN zonas z ON u.zona_id = z.id
            ORDER BY u.id
        `;

        const [resultado] = await pool.query(sql);

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Consultar un umbral por ID
const obtenerUmbral = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'SELECT * FROM umbrales WHERE id = ?';

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'Umbral no encontrado'
            });
        }

        res.json(resultado[0]);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Registrar un umbral
const crearUmbral = async (req, res) => {
    try {
        const { zona_id, humedad_minima, humedad_maxima } = req.body;

        if (
            !Number.isInteger(Number(zona_id)) ||
            !Number.isFinite(Number(humedad_minima)) ||
            !Number.isFinite(Number(humedad_maxima))
        ) {
            return res.status(400).json({
                mensaje: 'Los datos deben ser numéricos válidos'
            });
        }

        if (
            Number(humedad_minima) < 0 ||
            Number(humedad_maxima) > 100 ||
            Number(humedad_minima) >= Number(humedad_maxima)
        ) {
            return res.status(400).json({
                mensaje: 'Los umbrales deben estar entre 0 y 100, y el mínimo debe ser menor que el máximo'
            });
        }

        const sql = `
            INSERT INTO umbrales
            (zona_id, humedad_minima, humedad_maxima)
            VALUES (?, ?, ?)
        `;

        const [resultado] = await pool.query(sql, [
            zona_id,
            humedad_minima,
            humedad_maxima
        ]);

        res.status(201).json({
            mensaje: 'Umbral registrado correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensaje: 'Esta zona ya tiene un umbral registrado'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({
                mensaje: 'La zona indicada no existe'
            });
        }

        res.status(500).json({ mensaje: error.message });
    }
};

// Actualizar un umbral
const actualizarUmbral = async (req, res) => {
    try {
        const { id } = req.params;
        const { humedad_minima, humedad_maxima } = req.body;

        if (
            !Number.isFinite(Number(humedad_minima)) ||
            !Number.isFinite(Number(humedad_maxima))
        ) {
            return res.status(400).json({
                mensaje: 'Los valores deben ser numéricos'
            });
        }

        if (
            Number(humedad_minima) < 0 ||
            Number(humedad_maxima) > 100 ||
            Number(humedad_minima) >= Number(humedad_maxima)
        ) {
            return res.status(400).json({
                mensaje: 'Rango de humedad inválido'
            });
        }

        const sql = `
            UPDATE umbrales
            SET humedad_minima = ?, humedad_maxima = ?
            WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [
            humedad_minima,
            humedad_maxima,
            id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Umbral no encontrado'
            });
        }

        res.json({ mensaje: 'Umbral actualizado correctamente' });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Eliminar un umbral
const eliminarUmbral = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM umbrales WHERE id = ?';

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Umbral no encontrado'
            });
        }

        res.json({ mensaje: 'Umbral eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    obtenerUmbrales,
    obtenerUmbral,
    crearUmbral,
    actualizarUmbral,
    eliminarUmbral
};