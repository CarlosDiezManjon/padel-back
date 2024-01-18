const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuario.controller')

router.get('/usuarios', usuarioController.getUsers)
router.get('/usuarios/:id', usuarioController.getUserById)
router.post('/regitro', usuarioController.createUser)
router.post('/login', usuarioController.login)
router.put('/usuarios/:id', usuarioController.updateUser)
router.delete('/usuarios/:id', usuarioController.deleteUser)
router.get('/confirm-usuario/:token', usuarioController.confirmUser)
router.put('/activar-usuario/:id', usuarioController.activateUser)

module.exports = router
