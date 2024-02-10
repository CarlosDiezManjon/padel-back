const express = require('express')
const router = express.Router()
const actividadController = require('../controllers/actividad.controller')

router.get('/actividades', actividadController.getActividades)
router.get('/actividades/:id', actividadController.getActividadById)
router.post('/actividades', actividadController.createActividad)
router.put('/actividades/:id', actividadController.updateActividad)
router.delete('/actividades/:id', actividadController.deactivateActividad)
router.put('/activar-actividad/:id', actividadController.activateActividad)

module.exports = router
