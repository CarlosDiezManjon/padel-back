const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuario.controller')

router.get('/usuarios', usuarioController.getUsers)
router.post('/usuarios', usuarioController.createUser)
router.post('/login', usuarioController.login)
router.put('/usuarios/:id', usuarioController.updateUser)
router.delete('/usuarios/:id', usuarioController.deleteUser)
router.get(
  '/confirm-usuario/:token',
  usuarioController.confirmUser,
)

module.exports = router
