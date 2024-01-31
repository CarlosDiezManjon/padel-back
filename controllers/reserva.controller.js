const db = require('../config/db')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')
const moment = require('moment')

exports.getParrillaPistas = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const { fecha } = req.params

    let reservas = await db.any(
      "SELECT Reservas.*,(Reservas.fecha_inicio AT TIME ZONE 'UTC') as fecha_inicio, (Reservas.fecha_fin AT TIME ZONE 'UTC') as fecha_fin, Pistas.nombre, Pistas.duracion_reserva, Usuarios.username FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id INNER JOIN Usuarios ON Reservas.usuario_id = Usuarios.id WHERE DATE(Reservas.fecha_inicio) = $1 AND estado = 'Confirmada'",
      [fecha],
    )

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
          propia: false,
          selected: false,
          toCancel: false,
          pista: {
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
          },
          past: time.isBefore(moment.utc()),
        }

        reservas.forEach((r) => {
          const reservaTime = moment.utc(r.fecha_inicio)
          if (slot.startTime.isSame(reservaTime) && r.pista_id === p.id) {
            slot.reserva = r
            if (user.tipo !== 2) {
              if (r.usuario_id !== user.id) {
                delete slot.reserva.username
              } else {
                slot.propia = true
              }
            }
          }
        })

        p.parrilla.push(slot)
      }
    })

    res.json({ success: true, pistas })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.createReservas = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  logger.info('Creando reserva : Usuario ' + user.username)
  try {
    const { reservas, importeTotal } = req.body
    const reservasInsertadas = []
    const saldo = parseFloat(user.saldo)

    if (saldo < importeTotal) {
      return res.status(200).json({ error: 'Saldo insuficiente' })
    }

    for (const reserva of reservas) {
      const { pista, startTime, endTime } = reserva
      const { id } = pista
      const pistaFromDb = await db.one('SELECT * FROM Pistas WHERE id = $1', [id])
      if (pistaFromDb.activo == false) {
        return res.status(200).json({ error: 'La pista no está activa' })
      }
      const importe_pista = parseFloat(pistaFromDb.precio)
      const reservasPista = await db.any(
        'SELECT * FROM Reservas WHERE pista_id = $1 AND fecha_inicio = $2 AND estado = $3',
        [pistaFromDb.id, startTime, 'Confirmada'],
      )
      if (reservasPista.length > 0) {
        return res.status(200).json({ error: 'La pista ya está reservada' })
      }

      const reservaInsertada = await db.one(
        'INSERT INTO Reservas (usuario_id, pista_id, importe, fecha_inicio, fecha_fin, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user.id, pistaFromDb.id, importe_pista, startTime, endTime, 'Confirmada'],
      )
      reservasInsertadas.push(reservaInsertada)

      const movimiento = {
        usuario_id: user.id,
        reserva_id: reservaInsertada.id,
        motivo: 'Reserva',
        importe: importe_pista,
        fecha: moment.utc().format('YYYY-MM-DD HH:mm'),
        tipo: 'Gasto',
      }
      await db.one(
        'INSERT INTO Movimientos (usuario_id, reserva_id, motivo, importe, fecha, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          movimiento.usuario_id,
          movimiento.reserva_id,
          movimiento.motivo,
          movimiento.importe,
          movimiento.fecha,
          movimiento.tipo,
        ],
      )
    }
    let importeTotalInsertado = reservasInsertadas.reduce(
      (total, reserva) => total + parseFloat(reserva.importe),
      0,
    )
    let saldoActualizado = saldo - importeTotalInsertado
    await db.one('UPDATE Usuarios SET saldo = $1 WHERE id = $2 RETURNING *', [
      saldoActualizado,
      user.id,
    ])

    logger.info('Reserva creada : Usuario ' + user.username)
    res.json({ success: true, message: 'Reserva creada', reservasInsertadas })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.cancelReservas = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  logger.info('Cancelando reserva : Usuario ' + user.username)
  try {
    const { reservas } = req.body
    const reservasCanceladas = []
    for (const reserva of reservas) {
      const { id } = reserva.reserva
      const reservaFromDb = await db.one('SELECT * FROM Reservas WHERE estado = $1 AND id = $2', [
        'Confirmada',
        id,
      ])
      if (!reservaFromDb) {
        return res.status(200).json({ error: 'La reserva no existe' })
      }
      if (reservaFromDb.usuario_id !== user.id && user.tipo !== 2) {
        return res.status(200).json({ error: 'No tienes permisos para cancelar esta reserva' })
      }

      const now = moment.utc()
      const reservaStartTime = moment.utc(reservaFromDb.fecha_inicio)
      const diffInMinutes = reservaStartTime.diff(now, 'minutes')
      if (diffInMinutes < 60) {
        return res.status(200).json({
          error:
            'No puedes cancelar esta reserva menos de 1 hora antes. ' +
            reserva.pista.nombre +
            ' ' +
            reservaStartTime.format('HH:mm'),
        })
      }

      const reservaCancelada = await db.one(
        'UPDATE Reservas SET estado = $1 WHERE id = $2 RETURNING *',
        ['Cancelada', reservaFromDb.id],
      )
      reservasCanceladas.push(reservaCancelada)

      const movimiento = {
        usuario_id: reservaCancelada.usuario_id,
        reserva_id: reservaCancelada.id,
        motivo: 'Cancelación',
        importe: reservaCancelada.importe,
        fecha: moment.utc().format('YYYY-MM-DD HH:mm'),
        tipo: 'Ingreso',
      }
      await db.one(
        'INSERT INTO Movimientos (usuario_id, reserva_id, motivo, importe, fecha, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          movimiento.usuario_id,
          movimiento.reserva_id,
          movimiento.motivo,
          movimiento.importe,
          movimiento.fecha,
          movimiento.tipo,
        ],
      )
    }
    let importeTotalCancelado = reservasCanceladas.reduce(
      (total, reserva) => total + parseFloat(reserva.importe),
      0,
    )
    let saldoActualizado = parseFloat(user.saldo) + importeTotalCancelado
    await db.one('UPDATE Usuarios SET saldo = $1 WHERE id = $2 RETURNING *', [
      saldoActualizado,
      user.id,
    ])

    logger.info('Reserva cancelada : Usuario ' + user.username)
    res.json({ success: true, message: 'Reserva cancelada', reservasCanceladas })
  } catch (error) {
    logger.error(error)
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
      "SELECT Reservas.*, Pistas.nombre, Pistas.duracion_reserva, (Reservas.fecha_inicio AT TIME ZONE 'UTC') as fecha_inicio, (Reservas.fecha_fin AT TIME ZONE 'UTC') as fecha_fin FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id where usuario_id = $1",
      [user.id],
    )
    res.json({ success: true, reservas })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// exports.getReservasAdmin = async (req, res) => {
//   const user = await validateUserFromToken(req, res)
//   if (!user) {
//     return
//   }
//   if (user.tipo !== 2) {
//     return res.status(401).json({
//       error: 'No tienes permisos para ver usuarios.',
//     })
//   }
//   try {
//     const reservas = await db.any(
//       'SELECT Reservas.*, Pistas.nombre, Pistas.duracion_reserva FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id',
//     )
//     res.json({ success: true, reservas })
//   } catch (error) {
//     res.status(400).json({ error: error.message })
//   }
// }

// exports.getReservaById = async (req, res) => {
//   try {
//     const { id } = req.params
//     const reserva = await db.one('SELECT * FROM Reservas WHERE id = $1', [id])
//     res.json({ success: true, reserva })
//   } catch (error) {
//     res.status(400).json({ error: error.message })
//   }
// }

// exports.updateReserva = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { usuario_id, pista_id, importe, fecha } = req.body
//     const reserva = await db.one(
//       'UPDATE Reservas SET usuario_id = $1,pista_id = $2, importe = $3  fecha = $4 WHERE id = $5 RETURNING *',
//       [usuario_id, pista_id, importe, fecha, id],
//     )
//     res.json({ success: true, message: 'Reserva actualizada', reserva })
//   } catch (error) {
//     res.status(400).json({ error: error.message })
//   }
// }

// exports.deleteReserva = async (req, res) => {
//   try {
//     const { id } = req.params
//     const reserva = await db.one('DELETE FROM Reservas WHERE id = $1 RETURNING *', [id])
//     res.json({ success: true, message: 'Reserva eliminada', reserva })
//   } catch (error) {
//     res.status(400).json({ error: error.message })
//   }
// }
