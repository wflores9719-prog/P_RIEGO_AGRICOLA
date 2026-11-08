const express = require('express');
const router = express.Router();

const {
    obtenerClima,
    actualizarClima
} = require('../controllers/climaController');

router.get('/', obtenerClima);
router.post('/', actualizarClima);

module.exports = router;