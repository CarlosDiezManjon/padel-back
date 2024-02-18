const express = require('express')
const router = express.Router()
const reservaController = require('../controllers/reserva.controller')

router.get('/reservas', reservaController.getReservasUser)
//router.get('/reservas-admin', reservaController.getReservasAdmin)
//router.get('/reservas/:id', reservaController.getReservaById)
router.post('/reservas', reservaController.createReservas)
//router.put('/reservas/:id', reservaController.updateReserva)
router.put('/cancel-reservas', reservaController.cancelReservas)
//router.delete('/reservas/:id', reservaController.deleteReserva)
router.get('/parrilla/:actividad_id/:fecha', reservaController.getParrillaPistas)
module.exports = router
