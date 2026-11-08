const pool = require('../config/db');

// Convertir los días almacenados en un arreglo
const convertirDias = (dias) => {
    return dias.split(',').map(dia => dia.trim().toLowerCase());
};

// Convertir una hora HH:MM:SS a minutos
const convertirMinutos = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return (horas * 60) + minutos;
};

// Comprobar si dos horarios se superponen
const existeConflicto = async (
    zona_id,
    hora_inicio,
    duracion_minutos,
    dias_semana,
    idExcluir = null
) => {
    let sql = `
        SELECT *
        FROM horarios
        WHERE zona_id = ?
        AND estado = 'activo'
    `;

    const parametros = [zona_id];

    if (idExcluir !== null) {
        sql += ' AND id != ?';
        parametros.push(idExcluir);
    }

    const [horarios] = await pool.query(sql, parametros);

    const nuevosDias = convertirDias(dias_semana);
    const nuevoInicio = convertirMinutos(hora_inicio);
    const nuevoFin = nuevoInicio + Number(duracion_minutos);

    for (const horario of horarios) {
        const diasExistentes = convertirDias(horario.dias_semana);

        const comparteDia = nuevosDias.some(dia =>
            diasExistentes.includes(dia)
        );

        if (comparteDia) {
            const inicioExistente = convertirMinutos(horario.hora_inicio);
            const finExistente =
                inicioExistente + Number(horario.duracion_minutos);

            if (
                nuevoInicio < finExistente &&
                nuevoFin > inicioExistente
            ) {
                return true;
            }
        }
    }

    return false;
};

// Consultar todos los horarios
const obtenerHorarios = async (req, res) => {
    try {
        const sql = `
            SELECT h.*, z.nombre AS zona
            FROM horarios h
            INNER JOIN zonas z ON h.zona_id = z.id
            ORDER BY h.hora_inicio
        `;

        const [resultado] = await pool.query(sql);

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Consultar un horario por ID
const obtenerHorario = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'SELECT * FROM horarios WHERE id = ?';

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'Horario no encontrado'
            });
        }

        res.json(resultado[0]);

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// Registrar un horario
const crearHorario = async (req, res) => {
    try {
        const {
            zona_id,
            hora_inicio,
            duracion_minutos,
            dias_semana
        } = req.body;

        if (
            !Number.isInteger(Number(zona_id)) ||
            !Number.isInteger(Number(duracion_minutos)) ||
            !hora_inicio ||
            !dias_semana
        ) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios y deben tener un formato válido'
            });
        }

        const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

        if (!formatoHora.test(hora_inicio)) {
            return res.status(400).json({
                mensaje: 'Formato de hora inválido. Utilice HH:MM o HH:MM:SS'
            });
        }

        const duracion = Number(duracion_minutos);

        if (
            duracion <= 0 ||
            convertirMinutos(hora_inicio) + duracion > 1440
        ) {
            return res.status(400).json({
                mensaje: 'La duración debe ser positiva y el horario no puede pasar de medianoche'
            });
        }

        const diasPermitidos = [
            'lunes', 'martes', 'miércoles',
            'jueves', 'viernes', 'sábado', 'domingo'
        ];

        const dias = convertirDias(dias_semana);

        if (
            dias.length === 0 ||
            dias.some(dia => !diasPermitidos.includes(dia)) ||
            new Set(dias).size !== dias.length
        ) {
            return res.status(400).json({
                mensaje: 'Los días de la semana no son válidos o están repetidos'
            });
        }

        const conflicto = await existeConflicto(
            zona_id,
            hora_inicio,
            duracion,
            dias_semana
        );

        if (conflicto) {
            return res.status(409).json({
                mensaje: 'El horario se superpone con otro horario activo de esta zona'
            });
        }

        const sql = `
            INSERT INTO horarios
            (zona_id, hora_inicio, duracion_minutos, dias_semana)
            VALUES (?, ?, ?, ?)
        `;

        const [resultado] = await pool.query(sql, [
            zona_id,
            hora_inicio,
            duracion,
            dias.map(dia => dia.charAt(0).toUpperCase() + dia.slice(1)).join(',')
        ]);

        res.status(201).json({
            mensaje: 'Horario registrado correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({
                mensaje: 'La zona indicada no existe'
            });
        }

        res.status(500).json({ mensaje: error.message });
    }
};

// Actualizar un horario
const actualizarHorario = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            zona_id,
            hora_inicio,
            duracion_minutos,
            dias_semana,
            estado
        } = req.body;

        if (
            !Number.isInteger(Number(zona_id)) ||
            !Number.isInteger(Number(duracion_minutos)) ||
            !hora_inicio ||
            !dias_semana ||
            !['activo', 'inactivo'].includes(estado)
        ) {
            return res.status(400).json({
                mensaje: 'Los datos del horario son incompletos o inválidos'
            });
        }

        const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
        const duracion = Number(duracion_minutos);

        if (
            !formatoHora.test(hora_inicio) ||
            duracion <= 0 ||
            convertirMinutos(hora_inicio) + duracion > 1440
        ) {
            return res.status(400).json({
                mensaje: 'La hora o duración del horario no son válidas'
            });
        }

        const diasPermitidos = [
            'lunes', 'martes', 'miércoles',
            'jueves', 'viernes', 'sábado', 'domingo'
        ];

        const dias = convertirDias(dias_semana);

        if (
            dias.length === 0 ||
            dias.some(dia => !diasPermitidos.includes(dia)) ||
            new Set(dias).size !== dias.length
        ) {
            return res.status(400).json({
                mensaje: 'Los días de la semana no son válidos o están repetidos'
            });
        }

        if (estado === 'activo') {
            const conflicto = await existeConflicto(
                zona_id,
                hora_inicio,
                duracion,
                dias_semana,
                id
            );

            if (conflicto) {
                return res.status(409).json({
                    mensaje: 'El horario se superpone con otro horario activo de esta zona'
                });
            }
        }

        const sql = `
            UPDATE horarios
            SET zona_id = ?, hora_inicio = ?,
                duracion_minutos = ?, dias_semana = ?, estado = ?
            WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [
            zona_id,
            hora_inicio,
            duracion,
            dias.map(dia => dia.charAt(0).toUpperCase() + dia.slice(1)).join(','),
            estado,
            id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Horario no encontrado'
            });
        }

        res.json({ mensaje: 'Horario actualizado correctamente' });

    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({
                mensaje: 'La zona indicada no existe'
            });
        }

        res.status(500).json({ mensaje: error.message });
    }
};

// Eliminar un horario
const eliminarHorario = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM horarios WHERE id = ?';

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Horario no encontrado'
            });
        }

        res.json({ mensaje: 'Horario eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    obtenerHorarios,
    obtenerHorario,
    crearHorario,
    actualizarHorario,
    eliminarHorario
};