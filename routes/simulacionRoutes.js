const express = require('express');
const router = express.Router();

const {
    ejecutarSimulacion,
    ejecutarSensores
} = require('../controllers/simulacionController');

router.post('/ejecutar', ejecutarSimulacion);
router.post('/sensores', ejecutarSensores);

module.exports = router;