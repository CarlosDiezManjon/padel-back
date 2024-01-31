const express = require('express')
const router = express.Router()
const movimientoController = require('../controllers/movimiento.controller')

router.get('/movimientos', movimientoController.getMovimientos)

module.exports = router
