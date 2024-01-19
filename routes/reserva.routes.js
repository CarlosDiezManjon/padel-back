const express = require('express')
const router = express.Router()
const reservaController = require('../controllers/reserva.controller')

router.get('/reservas', reservaController.getReservasUser)
router.get('/reservas-admin', reservaController.getReservasAdmin)
router.get('/reservas/:id', reservaController.getReservaById)
router.post('/reservas', reservaController.createReserva)
router.put('/reservas/:id', reservaController.updateReserva)
router.delete('/reservas/:id', reservaController.deleteReserva)
module.exports = router
