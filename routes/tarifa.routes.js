const express = require('express')
const router = express.Router()
const tarifaController = require('../controllers/tarifa.controller')

router.get('/tarifas', tarifaController.getTarifas)
router.get('/tarifas/:id', tarifaController.getTarifaById)
router.post('/tarifas', tarifaController.createTarifa)
router.put('/tarifas/:id', tarifaController.updateTarifa)
router.delete('/tarifas/:id', tarifaController.deactivateTarifa)
router.put('/activar-tarifa/:id', tarifaController.activateTarifa)
router.get('/tarifa-actual', tarifaController.getTarifaActual)

module.exports = router
