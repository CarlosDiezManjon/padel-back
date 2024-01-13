const { SECRET_KEY } = require('../config/constants')
const db = require('../config/db')
const jwt = require('jsonwebtoken')

const {
  generarCodigoRegistro,
  sendConfirmationEmail,
} = require('../config/utils')
exports.createUser = async (req, res) => {
  try {
    const {
      username,
      nombre,
      apellidos,
      password,
      email,
      telefono,
      tipo,
    } = req.body
    const fecha_alta = new Date()
    const saldo = 0
    const tokenConfirmacion = generarCodigoRegistro()
    const usuario = await db.one(
      'INSERT INTO Usuarios(username, password, nombre, apellidos, email, telefono, tipo, fecha_alta, saldo, token_activacion) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [
        username,
        password,
        nombre,
        apellidos,
        email,
        telefono,
        tipo,
        fecha_alta,
        saldo,
        tokenConfirmacion,
      ],
    )
    const emailSent = await sendConfirmationEmail(
      email,
      tokenConfirmacion,
    )
    if (emailSent) {
      res.json({ success: true, data: usuario })
    } else {
      res.status(400).json({
        error: 'Error al enviar el correo de confirmación',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    const usuario = await db.one(
      'SELECT id,username,nombre, apellidos, email,telefono,saldo, tipo, fecha_alta FROM Usuarios WHERE username = $1 AND password = $2',
      [username, password],
    )
    const token = jwt.sign(usuario, SECRET_KEY, {
      expiresIn: '1h',
    })
    res.json({ success: true, token: token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getUsers = async (req, res) => {
  try {
    const usuarios = await db.any(
      'SELECT * FROM Usuarios where activo is false',
    )
    res.json(usuarios)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al obtener usuarios.' })
  }
}

exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params
    const usuario = await db.one(
      'SELECT * FROM Usuarios WHERE username = $1',
      [username],
    )
    res.json(usuario)
  } catch (error) {
    res.status(500).json({
      error:
        'Error al obtener usuario por nombre de usuario.',
    })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const fecha_baja = new Date()
    const usuario = await db.one(
      'UPDATE Usuarios SET fecha_baja = $1, activo = false WHERE id = $2 RETURNING *',
      [fecha_baja, id],
    )
    res.json(usuario)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al eliminar usuario.' })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const {
      username,
      nombre,
      apellidos,
      password,
      email,
      telefono,
      tipo,
    } = req.body
    const usuario = await db.one(
      'UPDATE Usuarios SET username = $1, password = $2, nombre = $3, apellidos = $4, email = $5, telefono = $6, tipo = $7 WHERE id = $8 RETURNING *',
      [
        username,
        password,
        nombre,
        apellidos,
        email,
        telefono,
        tipo,
        id,
      ],
    )
    res.json(usuario)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.confirmUser = async (req, res) => {
  try {
    const { token } = req.params
    const usuarioToConfirm = await db.one(
      'SELECT * FROM Usuarios WHERE activo = false AND token_activacion = $1 RETURNING *',
      [token],
    )
    if (!usuarioToConfirm) {
      res.status(400).json({
        error: 'Ya se ha confirmado el usuario.',
      })
    }
    const usuario = await db.one(
      'UPDATE Usuarios SET activo = true WHERE token_activacion = $1 RETURNING *',
      [token],
    )
    const contenidoHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de cuenta PADELAPP</title>
    </head>
    <body>
      <h1>Confirmación de correo completada.</h1>
      <a href='https://www.google.es'>Acceda a la app</a>
    </body>
    </html>
  `
    if (usuario) {
      res.setHeader('Content-Type', 'text/html')
      res.send(contenidoHTML)
    } else {
      res.status(400).json({
        error: 'Error al confirmar el usuario.',
      })
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: 'Error al confirmar usuario.' })
  }
}
