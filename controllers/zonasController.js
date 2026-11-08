const pool = require('../config/db');

// Consultar todas las zonas
const obtenerZonas = async (req, res) => {
    try {
        const sql = 'SELECT * FROM zonas ORDER BY id';

        const [resultado] = await pool.query(sql);

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Consultar una zona por ID
const obtenerZona = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'SELECT * FROM zonas WHERE id = ?';

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'Zona no encontrada' });
        }

        res.json(resultado[0]);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Registrar una zona
const crearZona = async (req, res) => {
    try {
        const { nombre, tipo_cultivo, superficie, ubicacion } = req.body;

        if (!nombre || !tipo_cultivo || !superficie || !ubicacion) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const sql = `
            INSERT INTO zonas (nombre, tipo_cultivo, superficie, ubicacion)
            VALUES (?, ?, ?, ?)
        `;

        const [resultado] = await pool.query(sql, [
            nombre,
            tipo_cultivo,
            superficie,
            ubicacion
        ]);

        res.status(201).json({
            mensaje: 'Zona registrada correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Actualizar una zona
const actualizarZona = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo_cultivo, superficie, ubicacion, estado } = req.body;

        if (!nombre || !tipo_cultivo || !superficie || !ubicacion || !estado) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const sql = `
            UPDATE zonas
            SET nombre = ?, tipo_cultivo = ?, superficie = ?,
                ubicacion = ?, estado = ?
            WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [
            nombre,
            tipo_cultivo,
            superficie,
            ubicacion,
            estado,
            id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Zona no encontrada' });
        }

        res.json({ mensaje: 'Zona actualizada correctamente' });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Eliminar una zona
const eliminarZona = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM zonas WHERE id = ?';

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Zona no encontrada' });
        }

        res.json({ mensaje: 'Zona eliminada correctamente' });

    } catch (error) {
        res.status(500).json({
            mensaje: 'No se pudo eliminar la zona. Puede tener registros relacionados.',
            error: error.message
        });
    }
};

module.exports = {
    obtenerZonas,
    obtenerZona,
    crearZona,
    actualizarZona,
    eliminarZona
};