const express = require('express');
const router = express.Router();

const {
    obtenerValvulas,
    controlarValvula
} = require('../controllers/valvulasController');

router.get('/', obtenerValvulas);
router.put('/:id', controlarValvula);

module.exports = router;