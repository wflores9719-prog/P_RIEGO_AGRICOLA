const { evaluarRiego, simularSensores } = require('../services/simulacionService');

// Ejecutar evaluación manual
const ejecutarSimulacion = async (req, res) => {
    try {
        const decisiones = await evaluarRiego();

        res.json({
            mensaje: 'Evaluación de riego ejecutada correctamente',
            decisiones
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al ejecutar la simulación',
            error: error.message
        });
    }
};

// Ejecutar simulación de sensores
const ejecutarSensores = async (req, res) => {
    try {
        const resultados = await simularSensores();

        res.json({
            mensaje: 'Simulación de sensores ejecutada correctamente',
            resultados
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al simular sensores',
            error: error.message
        });
    }
};

module.exports = {
    ejecutarSimulacion,
    ejecutarSensores
};