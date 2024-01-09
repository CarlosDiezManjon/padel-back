const express = require('express');
const router = express.Router();
const pistaController = require('../controllers/pista.controller');

router.get('/pistas', pistaController.getPistas);
router.post('/pistas', pistaController.createPista);


module.exports = router;