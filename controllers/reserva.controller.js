const db = require('../config/db')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')

exports.getReservasAdmin = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 2) {
    return res.status(401).json({
      error: 'No tienes permisos para ver usuarios.',
    })
  }
  try {
    const reservas = await db.any(
      'SELECT Reservas.*, Pistas.nombre, Pistas.duracion_reserva FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id',
    )
    res.json({ success: true, reservas })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.getReservasUser = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }

  try {
    const reservas = await db.any(
      'SELECT Reservas.*, Pistas.nombre, Pistas.duracion_reserva FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id where usuario_id = $1',
      [user.id],
    )
    res.json({ success: true, reservas })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
exports.getReservaById = async (req, res) => {
  try {
    const { id } = req.params
    const reserva = await db.one('SELECT * FROM Reservas WHERE id = $1', [id])
    res.json({ success: true, reserva })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.createReserva = async (req, res) => {
  try {
    const { usuario_id, fecha, hora_inicio, hora_fin, estado } = req.body
    const reserva = await db.one(
      'INSERT INTO Reservas (usuario_id, fecha, hora_inicio, hora_fin, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [usuario_id, fecha, hora_inicio, hora_fin, estado],
    )
    res.json({ success: true, message: 'Reserva creada', reserva })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.updateReserva = async (req, res) => {
  try {
    const { id } = req.params
    const { usuario_id, fecha, hora_inicio, hora_fin, estado } = req.body
    const reserva = await db.one(
      'UPDATE Reservas SET usuario_id = $2, fecha = $3, hora_inicio = $4, hora_fin = $5, estado = $6 WHERE id = $7 RETURNING *',
      [usuario_id, fecha, hora_inicio, hora_fin, estado, id],
    )
    res.json({ success: true, message: 'Reserva actualizada', reserva })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.deleteReserva = async (req, res) => {
  try {
    const { id } = req.params
    const reserva = await db.one('DELETE FROM Reservas WHERE id = $1 RETURNING *', [id])
    res.json({ success: true, message: 'Reserva eliminada', reserva })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
