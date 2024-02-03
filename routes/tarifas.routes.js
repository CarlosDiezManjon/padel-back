const express = require('express')
const router = express.Router()
const tarifasController = require('../controllers/tarifas.controller')

router.get('/tarifas', tarifasController.getTarifas)
router.get('/tarifas/:id', tarifasController.getTarifaById)
router.post('/tarifas', tarifasController.createTarifa)
router.put('/tarifas/:id', tarifasController.updateTarifa)
router.delete('/tarifas/:id', tarifasController.deactivateTarifa)
router.put('/activar-tarifa/:id', tarifasController.activateTarifa)

module.exports = router
