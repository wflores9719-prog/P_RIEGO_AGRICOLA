const express = require('express');
const router = express.Router();

const {
    obtenerUmbrales,
    obtenerUmbral,
    crearUmbral,
    actualizarUmbral,
    eliminarUmbral
} = require('../controllers/umbralesController');

router.get('/', obtenerUmbrales);
router.get('/:id', obtenerUmbral);
router.post('/', crearUmbral);
router.put('/:id', actualizarUmbral);
router.delete('/:id', eliminarUmbral);

module.exports = router;