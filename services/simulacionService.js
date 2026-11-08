const pool = require('../config/db');

// Evaluar la humedad de todas las zonas
const evaluarRiego = async () => {

    const sql = `
        SELECT
            z.id AS zona_id,
            z.nombre AS zona,
            u.humedad_minima,
            u.humedad_maxima,
            v.id AS valvula_id,
            v.estado AS estado_valvula,
            (
                SELECT l.valor
                FROM lecturas l
                INNER JOIN sensores s ON l.sensor_id = s.id
                WHERE s.zona_id = z.id
                AND s.tipo = 'humedad'
                ORDER BY l.fecha_hora DESC, l.id DESC
                LIMIT 1
            ) AS humedad
        FROM zonas z
        INNER JOIN umbrales u ON z.id = u.zona_id
        INNER JOIN valvulas v ON z.id = v.zona_id
        WHERE z.estado = 'activa'
    `;

    const [zonas] = await pool.query(sql);

    const decisiones = [];

    for (const zona of zonas) {

        if (zona.humedad === null) {
            decisiones.push({
                zona: zona.zona,
                decision: 'Sin lectura de humedad'
            });

            continue;
        }

        let nuevoEstado = zona.estado_valvula;
        let decision = 'Mantener estado';

        if (Number(zona.humedad) < Number(zona.humedad_minima)) {
            nuevoEstado = 'abierta';
            decision = 'Activar riego';
        }

        else if (Number(zona.humedad) >= Number(zona.humedad_maxima)) {
            nuevoEstado = 'cerrada';
            decision = 'Detener riego';
        }

        if (nuevoEstado !== zona.estado_valvula) {

            const sqlActualizar = `
                UPDATE valvulas
                SET estado = ?
                WHERE id = ?
            `;

            await pool.query(sqlActualizar, [
                nuevoEstado,
                zona.valvula_id
            ]);
        }

        decisiones.push({
            zona: zona.zona,
            humedad: Number(zona.humedad),
            humedad_minima: Number(zona.humedad_minima),
            humedad_maxima: Number(zona.humedad_maxima),
            valvula_anterior: zona.estado_valvula,
            valvula_actual: nuevoEstado,
            decision
        });
    }

    return decisiones;
};

// Simular nuevas lecturas de humedad y flujo
const simularSensores = async () => {

    const intervaloSegundos = 10;
    const flujoPorMinuto = 12;
    const consumoPorCiclo = flujoPorMinuto * (intervaloSegundos / 60);

    const sql = `
        SELECT
            z.id AS zona_id,
            z.nombre AS zona,
            v.id AS valvula_id,
            v.estado AS estado_valvula,
            sh.id AS sensor_humedad_id,
            sf.id AS sensor_flujo_id,
            (
                SELECT l.valor
                FROM lecturas l
                WHERE l.sensor_id = sh.id
                ORDER BY l.fecha_hora DESC, l.id DESC
                LIMIT 1
            ) AS humedad_actual
        FROM zonas z
        INNER JOIN valvulas v ON z.id = v.zona_id
        INNER JOIN sensores sh
            ON z.id = sh.zona_id AND sh.tipo = 'humedad'
        INNER JOIN sensores sf
            ON z.id = sf.zona_id AND sf.tipo = 'flujo'
        WHERE z.estado = 'activa'
        AND sh.estado = 'activo'
        AND sf.estado = 'activo'
    `;

    const [zonas] = await pool.query(sql);

    // Consultar el registro climático más reciente
    const [climaRows] = await pool.query(`
        SELECT temperatura, probabilidad_lluvia, lluvia_prevista
        FROM clima
        ORDER BY fecha_hora DESC, id DESC
        LIMIT 1
    `);

    const clima = climaRows[0];

    const suspenderPorLluvia = clima && (
        Boolean(clima.lluvia_prevista) ||
        Number(clima.probabilidad_lluvia) >= 70
    );

    const resultados = [];

    for (const zona of zonas) {

        // Suspender el riego si existe riesgo de lluvia
        if (suspenderPorLluvia) {

            if (zona.estado_valvula === 'abierta') {

                await pool.query(`
                    UPDATE valvulas
                    SET estado = 'cerrada'
                    WHERE id = ?
                `, [zona.valvula_id]);

            }

            decisiones.push({
                zona: zona.zona,
                valvula_anterior: zona.estado_valvula,
                valvula_actual: 'cerrada',
                decision: 'Suspensión climática',
                probabilidad_lluvia: Number(clima.probabilidad_lluvia)
            });

            continue;
        }
        
        if (zona.humedad_actual === null) {
            resultados.push({
                zona: zona.zona,
                mensaje: 'No existe una lectura de humedad'
            });

            continue;
        }

        const humedadAnterior = Number(zona.humedad_actual);

        let nuevaHumedad;
        let nuevoFlujo;

        if (zona.estado_valvula === 'abierta') {
            nuevaHumedad = Math.min(humedadAnterior + 2, 100);
            nuevoFlujo = flujoPorMinuto;
        } else {
            nuevaHumedad = Math.max(humedadAnterior - 0.2, 0);
            nuevoFlujo = 0;
        }

        nuevaHumedad = Number(nuevaHumedad.toFixed(2));

        // Registrar nueva lectura de humedad
        await pool.query(
            'INSERT INTO lecturas (sensor_id, valor) VALUES (?, ?)',
            [zona.sensor_humedad_id, nuevaHumedad]
        );

        // Registrar nueva lectura de flujo
        await pool.query(
            'INSERT INTO lecturas (sensor_id, valor) VALUES (?, ?)',
            [zona.sensor_flujo_id, nuevoFlujo]
        );

        // Consultar si existe una sesión de consumo activa
        const sqlConsumo = `
            SELECT id
            FROM consumos_agua
            WHERE valvula_id = ?
            AND estado = 'en_curso'
            ORDER BY id DESC
            LIMIT 1
        `;

        const [consumos] = await pool.query(sqlConsumo, [
            zona.valvula_id
        ]);

        if (zona.estado_valvula === 'abierta') {

            if (consumos.length === 0) {

                // Crear una nueva sesión de consumo
                await pool.query(`
                    INSERT INTO consumos_agua
                    (zona_id, valvula_id, litros_consumidos)
                    VALUES (?, ?, ?)
                `, [
                    zona.zona_id,
                    zona.valvula_id,
                    consumoPorCiclo
                ]);

            } else {

                // Acumular consumo en la sesión existente
                await pool.query(`
                    UPDATE consumos_agua
                    SET litros_consumidos = litros_consumidos + ?
                    WHERE id = ?
                `, [
                    consumoPorCiclo,
                    consumos[0].id
                ]);
            }

        } else if (consumos.length > 0) {

            // Finalizar la sesión cuando se cierra la válvula
            await pool.query(`
                UPDATE consumos_agua
                SET estado = 'finalizado',
                    fecha_fin = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [consumos[0].id]);
        }

        resultados.push({
            zona: zona.zona,
            valvula: zona.estado_valvula,
            humedad_anterior: humedadAnterior,
            humedad_nueva: nuevaHumedad,
            flujo_litros_minuto: nuevoFlujo,
            consumo_ciclo_litros:
                zona.estado_valvula === 'abierta' ? consumoPorCiclo : 0
        });
    }

    return resultados;
};

module.exports = {
    evaluarRiego,
    simularSensores
};