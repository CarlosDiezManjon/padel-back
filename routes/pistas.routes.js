const express = require('express')
const router = express.Router()
const pistaController = require('../controllers/pista.controller')

router.get('/pistas', pistaController.getPistas)
router.get('/pistas/:id', pistaController.getPistaById)
router.post('/pistas', pistaController.createPista)
router.put('/pistas/:id', pistaController.updatePista)
router.delete('/pistas/:id', pistaController.deletePista)
router.put('/activar-pista/:id', pistaController.activatePista)

module.exports = router
