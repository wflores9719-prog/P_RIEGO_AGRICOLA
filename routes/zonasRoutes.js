const express = require('express');
const router = express.Router();

const {
    obtenerZonas,
    obtenerZona,
    crearZona,
    actualizarZona,
    eliminarZona
} = require('../controllers/zonasController');

router.get('/', obtenerZonas);
router.get('/:id', obtenerZona);
router.post('/', crearZona);
router.put('/:id', actualizarZona);
router.delete('/:id', eliminarZona);

module.exports = router;