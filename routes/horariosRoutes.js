const express = require('express');
const router = express.Router();

const {
    obtenerHorarios,
    obtenerHorario,
    crearHorario,
    actualizarHorario,
    eliminarHorario
} = require('../controllers/horariosController');

router.get('/', obtenerHorarios);
router.get('/:id', obtenerHorario);
router.post('/', crearHorario);
router.put('/:id', actualizarHorario);
router.delete('/:id', eliminarHorario);

module.exports = router;