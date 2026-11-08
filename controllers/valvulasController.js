const pool = require('../config/db');

// Consultar todas las válvulas
const obtenerValvulas = async (req, res) => {
    try {
        const sql = `
            SELECT
                v.id,
                v.zona_id,
                z.nombre AS zona,
                v.nombre,
                v.estado
            FROM valvulas v
            INNER JOIN zonas z ON v.zona_id = z.id
            ORDER BY v.zona_id
        `;

        const [resultado] = await pool.query(sql);

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Cambiar estado de una válvula manualmente
const controlarValvula = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['abierta', 'cerrada'].includes(estado)) {
            return res.status(400).json({
                mensaje: 'El estado debe ser abierta o cerrada'
            });
        }

        const sql = `
            UPDATE valvulas
            SET estado = ?
            WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [estado, id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Válvula no encontrada'
            });
        }

        res.json({
            mensaje: `Válvula ${estado} correctamente`
        });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    obtenerValvulas,
    controlarValvula
};