const express = require('express');
const router = express.Router();

const {
    obtenerSensores,
    obtenerLecturas,
    obtenerHistorial
} = require('../controllers/sensoresController');

router.get('/', obtenerSensores);
router.get('/lecturas', obtenerLecturas);
router.get('/:id/historial', obtenerHistorial);

module.exports = router;