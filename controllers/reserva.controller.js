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

exports.getParrillaPistas = async (req, res) => {
  try {
    const { fecha } = req.params
    const reservas = await db.any(
      'SELECT Reservas.*, Pistas.nombre, Pistas.duracion_reserva, Usuarios.username FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id INNER JOIN Usuarios ON Reservas.usuario_id = Usuarios.id WHERE fecha = $1',
      [fecha],
    )
    const pistas = await db.any('SELECT * FROM Pistas where activo = true ORDER BY nombre ASC')
    pistas.forEach((p) => {
      const date = new Date(fecha)
      const [startHours, startMinutes, startSeconds] = p.hora_inicio.split(':').map(Number)
      const [endHours, endMinutes, endSeconds] = p.hora_fin.split(':').map(Number)
      const duration = parseFloat(p.duracion_reserva)

      const startTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startHours,
        startMinutes,
      )
      const endTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        endHours,
        endMinutes,
      )

      p.parrilla = []

      const startDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startTime.getHours(),
        startTime.getMinutes(),
      )
      const endDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        endTime.getHours(),
        endTime.getMinutes(),
      )

      for (
        let time = new Date(startDateTime);
        time < endDateTime;
        time.setMinutes(time.getMinutes() + duration)
      ) {
        const slot = {
          startTime: new Date(time),
          endTime: new Date(time.getTime() + duration * 60000),
        }
        reservas.forEach((r) => {
          const [reservaHours, reservaMinutes, reservaSeconds] = r.hora.split(':').map(Number)
          const reservaTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            reservaHours,
            reservaMinutes,
          )
          if (slot.startTime.getTime() === reservaTime.getTime() && r.pista_id === p.id) {
            slot.reserva = r
          } else {
            slot.reserva = null
          }
        })
        p.parrilla.push(slot)
      }
    })

    res.json({ success: true, pistas })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
