const db = require('../config/db')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')
const moment = require('moment')
const { parseFloatsPista } = require('../config/utils')

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
      "SELECT Reservas.*, Pistas.nombre, Pistas.duracion_reserva, (Reservas.fecha AT TIME ZONE 'UTC') as fecha FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id where usuario_id = $1",
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
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  logger.info('Creando reserva : Usuario ' + user.username)
  try {
    const { reservas } = req.body
    console.log(reservas)
    res.json({ success: true, message: 'Reserva creada', reserva })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.updateReserva = async (req, res) => {
  try {
    const { id } = req.params
    const { usuario_id, pista_id, importe, fecha } = req.body
    const reserva = await db.one(
      'UPDATE Reservas SET usuario_id = $1,pista_id = $2, importe = $3  fecha = $4 WHERE id = $5 RETURNING *',
      [usuario_id, pista_id, importe, fecha, id],
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
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const { fecha } = req.params
    let reservas = []
    if (user.tipo == 2) {
      reservas = await db.any(
        'SELECT Reservas.*, Pistas.nombre, Pistas.duracion_reserva, Usuarios.username FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id INNER JOIN Usuarios ON Reservas.usuario_id = Usuarios.id WHERE DATE(Reservas.fecha) = $1',
        [fecha],
      )
    } else {
      reservas = await db.any(
        'SELECT Reservas.id, Reservas.pista_id,Reservas.fecha, Reservas.importe, Pistas.nombre, Pistas.duracion_reserva FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id WHERE DATE(Reservas.fecha) = $1',
        [fecha],
      )
    }

    const pistas = await db.any('SELECT * FROM Pistas where activo = true ORDER BY nombre ASC')
    const date = new Date(fecha)
    pistas.forEach((p) => {
      const [pistaStartHours, pistaStartMinutes] = p.hora_inicio.split(':').map(Number)
      const [pistaEndHours, pistaEndMinutes] = p.hora_fin.split(':').map(Number)
      const duration = parseFloat(p.duracion_reserva)

      const startTime = moment.utc([
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        pistaStartHours,
        pistaStartMinutes,
      ])
      const endTime = moment.utc([
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        pistaEndHours,
        pistaEndMinutes,
      ])

      p.parrilla = []

      for (
        let time = moment.utc(startTime);
        time.isBefore(endTime);
        time.add(duration, 'minutes')
      ) {
        const slot = {
          startTime: moment.utc(time),
          endTime: moment.utc(time).add(duration, 'minutes'),
          reserva: null,
        }

        reservas.forEach((r) => {
          const reservaTime = moment.utc(r.fecha)
          if (slot.startTime.isSame(reservaTime) && r.pista_id === p.id) {
            slot.reserva = r
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
