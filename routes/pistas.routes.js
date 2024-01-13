const express = require('express');
const router = express.Router();
const pistaController = require('../controllers/pista.controller');

router.get('/pistas', pistaController.getPistas);
router.post('/pistas', pistaController.createPista);
router.put('/pistas', pistaController.updatePista);
router.delete('/pistas/:id', pistaController.deletePista);
router.put('/pistas/active/:id', pistaController.activatePista);


module.exports = router;