const { SECRET_KEY } = require('../config/constants')
const db = require('../config/db')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const bcrypt = require('bcrypt')

const { generarCodigoRegistro, sendConfirmationEmail, cifrarPassword } = require('../config/utils')
const { validateUserFromToken } = require('../config/token.validation')
const constants = require('../config/constants')
const { confirmacionRegistroTemplate } = require('../config/mailTemplates')

exports.registro = async (req, res) => {
  logger.info('Creando usuario ' + req.body.username)
  try {
    const { username, nombre, apellidos, password, email, telefono, tipo } = req.body
    const fecha_alta = moment.utc().format('YYYY-MM-DD HH:mm')
    const saldo = 0
    const securedPassword = await cifrarPassword(password)
    const tokenConfirmacion = generarCodigoRegistro()
    const userSameUsername = await db.oneOrNone('SELECT * FROM Usuarios WHERE username = $1', [
      username,
    ])
    if (userSameUsername) {
      return res.status(400).json({
        error: 'Username ya existe',
      })
    }
    const userSameEmail = await db.oneOrNone(
      'SELECT * FROM Usuarios WHERE email = $1 AND activo = TRUE',
      [email],
    )
    if (userSameEmail) {
      logger.error('Email ya existe')
      return res.status(400).json({
        error: 'Email ya existe',
      })
    }
    const usuario = await db.one(
      'INSERT INTO Usuarios(username, password, nombre, apellidos, email, telefono, tipo, fecha_alta, saldo, token_activacion) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [
        username,
        securedPassword,
        nombre,
        apellidos,
        email,
        telefono,
        tipo ? tipo : 2,
        fecha_alta,
        saldo,
        tokenConfirmacion,
      ],
    )
    const emailSent = await sendConfirmationEmail(email, tokenConfirmacion)
    if (emailSent) {
      const { password: passwordToIgnore, ...userWithoutPassword } = usuario
      res.json({ success: true, userWithoutPassword })
    } else {
      res.status(400).json({
        error: 'Error al enviar el correo de confirmación',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.getSaldo = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const usuario = await db.one('SELECT saldo FROM Usuarios WHERE id = $1', [user.id])
    res.json({ success: true, saldo: usuario.saldo })
  } catch (error) {
    res.status(400).json({
      error: error.message,
    })
  }
}

exports.login = async (req, res) => {
  logger.info('Login usuario ' + req.body.username)
  try {
    const { username, password } = req.body
    const usuario = await db.oneOrNone(
      'SELECT id,username,nombre,password, apellidos, email,telefono,saldo, tipo, fecha_alta FROM Usuarios WHERE username = $1 AND activo = true',
      [username],
    )
    if (usuario === null) {
      return res.status(400).json({
        error: 'Usuario o contraseña incorrectos.',
      })
    }
    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido) {
      return res.status(400).json({
        error: 'Usuario o contraseña incorrectos.',
      })
    }
    const { password: passwordToIgnore, ...userWithoutPassword } = usuario
    const token = jwt.sign(userWithoutPassword, SECRET_KEY, {
      expiresIn: constants.TOKEN_EXPIRATION_TIME,
    })
    res.json({ success: true, token: token })
  } catch (error) {
    res.status(400).json({ error: 'Error de conexión' })
  }
}

exports.getUsers = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para ver usuarios.',
    })
  }
  try {
    const usuarios = await db.any(
      'SELECT id, username, nombre, apellidos, email,telefono, saldo, tipo,fecha_alta, fecha_baja, activo FROM Usuarios ORDER BY nombre ASC, apellidos ASC',
    )
    res.json({ success: true, usuarios })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.deactivateUser = async (req, res) => {
  logger.info('Dar de baja usuario ' + req.params.id)
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para dar de baja usuarios.',
    })
  }
  try {
    const { id } = req.params
    const fecha_baja = new Date()
    const usuario = await db.one(
      'UPDATE Usuarios SET fecha_baja = $1, activo = false WHERE id = $2 RETURNING *',
      [fecha_baja, id],
    )
    res.json({ success: true, message: 'Usuario dado de baja', usuario })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.activateUser = async (req, res) => {
  logger.info('Activar usuario ' + req.params.id)
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para activar usuarios.',
    })
  }
  try {
    const { id } = req.params
    const usuario = await db.one(
      'UPDATE Usuarios SET fecha_baja = $1, activo = true WHERE id = $2 RETURNING *',
      [null, id],
    )
    res.json({ success: true, message: 'Usuario activado', usuario })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.updateUser = async (req, res) => {
  logger.info('Actualizando usuario ' + req.body.username)
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para actualizar usuarios.',
    })
  }
  try {
    const { id } = req.params
    const { username, nombre, apellidos, email, telefono, tipo, saldo } = req.body
    let numero_socio = req.body.numero_socio
    if (tipo !== 1) {
      numero_socio = null
    }
    const usuario = await db.one(
      'UPDATE Usuarios SET username = $1, nombre = $2, apellidos = $3, email = $4, telefono = $5, tipo = $6, saldo = $7, numero_socio = $8 WHERE id = $9 RETURNING *',
      [username, nombre, apellidos, email, telefono, tipo, saldo, numero_socio, id],
    )
    res.json({ success: true, message: 'Usuario actualizado', usuario })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.getPerfil = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const usuario = await db.one(
      'SELECT id, username, nombre, apellidos, email, telefono, saldo, tipo,fecha_alta, fecha_baja, activo, email_verificado, numero_socio FROM Usuarios WHERE id = $1',
      [user.id],
    )
    res.json({ success: true, usuario })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.confirmUser = async (req, res) => {
  logger.info('Confirmando usuario con token: ' + req.params.token)
  try {
    const { token } = req.params
    const usuarioToConfirm = await db.one(
      'SELECT * FROM Usuarios WHERE activo = false AND token_activacion = $1',
      [token],
    )
    if (!usuarioToConfirm) {
      res.status(400).json({
        error: 'Ya se ha confirmado el usuario.',
      })
    }
    const usuario = await db.one(
      'UPDATE Usuarios SET activo = true AND email_verificado = true WHERE token_activacion = $1 RETURNING *',
      [token],
    )

    if (usuario) {
      res.setHeader('Content-Type', 'text/html')
      res.send(confirmacionRegistroTemplate)
    } else {
      res.status(400).json({
        error: 'Error al confirmar el usuario.',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.getUserById = async (req, res) => {
  const { id } = req.params
  try {
    const usuario = await db.one(
      'SELECT id, username, nombre, apellidos, email,telefono, saldo, tipo,fecha_alta, fecha_baja, activo, numero_socio FROM Usuarios WHERE id = $1',
      [id],
    )

    res.json({ success: true, usuario })
  } catch (error) {
    res.status(400).json({
      error: error.message,
    })
  }
}
