const db = require('../config/db')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')
const moment = require('moment')

const {
  sendReservaEmail,
  sendCancelacionEmail,
  dateUTCToLocalDateOnly,
  dateUTCToLocalTime,
} = require('../config/utils')

exports.getParrillaPistas = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const { fecha } = req.params

    let reservas = await db.any(
      "SELECT Reservas.*,(Reservas.fecha_inicio AT TIME ZONE 'UTC') as fecha_inicio, (Reservas.fecha_fin AT TIME ZONE 'UTC') as fecha_fin, Pistas.nombre, Pistas.duracion_reserva, Usuarios.username, Usuarios.nombre as nombre_usuario FROM Reservas INNER JOIN Pistas ON Reservas.pista_id = Pistas.id INNER JOIN Usuarios ON Reservas.usuario_id = Usuarios.id WHERE DATE(Reservas.fecha_inicio) = $1 AND estado = 'Confirmada'",
      [fecha],
    )

    let tarifas = await db.any('SELECT * FROM Tarifas where activo = true and tipo_usuario = $1', [
      user.tipo,
    ])
    if (tarifas.length === 0) {
      return res.status(200).json({ error: 'No hay tarifas activas para tu tipo de usuario' })
    }
    const isWeekend = moment.utc(fecha).isoWeekday() > 5
    tarifas = tarifas.filter((t) => {
      if (isWeekend) {
        return t.tipo_dia === 'FINDE' || t.tipo_dia === 'TODO'
      }
      return t.tipo_dia === 'SEMANA' || t.tipo_dia === 'TODO'
    })

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

        assignTarifa(time, date, slot, tarifas)

        reservas.forEach((r) => {
          const reservaTime = moment.utc(r.fecha_inicio)
          if (slot.startTime.isSame(reservaTime) && r.pista_id === p.id) {
            slot.reserva = r
            if (user.tipo !== 0) {
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
      const tarifa = await db.one('SELECT * FROM Tarifas WHERE id = $1', [reserva.tarifa.id])
      if (!tarifa) {
        return res.status(200).json({ error: 'La tarifa no existe' })
      }
      const reservasPista = await db.any(
        'SELECT * FROM Reservas WHERE pista_id = $1 AND fecha_inicio = $2 AND estado = $3',
        [pistaFromDb.id, startTime, 'Confirmada'],
      )
      if (reservasPista.length > 0) {
        return res.status(200).json({ error: 'La pista ya está reservada' })
      }

      let motivo = null
      if (user.tipo === 0) {
        motivo = req.body.motivo
      }

      const reservaInsertada = await db.one(
        "INSERT INTO Reservas (usuario_id, pista_id,tarifa_id, importe, fecha_inicio, fecha_fin, estado, motivo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *, fecha_inicio AT TIME ZONE 'UTC' as fecha_inicio",
        [
          user.id,
          pistaFromDb.id,
          tarifa.id,
          tarifa.precio,
          startTime,
          endTime,
          'Confirmada',
          motivo,
        ],
      )
      reservasInsertadas.push(reservaInsertada)

      const movimiento = {
        usuario_id: user.id,
        reserva_id: reservaInsertada.id,
        motivo: 'Reserva',
        importe: tarifa.precio,
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
      sendReservaEmail(user.email, user.nombre, reservaInsertada.fecha_inicio, pistaFromDb.nombre)
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
      const reservaFromDb = await db.one(
        `SELECT r.*, (r.fecha_inicio AT TIME ZONE 'UTC') as fecha_inicio FROM Reservas r WHERE estado = $1 AND id = $2`,
        ['Confirmada', id],
      )
      if (!reservaFromDb) {
        return res.status(200).json({ error: 'La reserva no existe' })
      }
      if (reservaFromDb.usuario_id !== user.id && user.tipo !== 0) {
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
            dateUTCToLocalTime(reservaStartTime),
        })
      }

      const reservaCancelada = await db.one(
        "UPDATE Reservas SET estado = $1 WHERE id = $2 RETURNING *, fecha_inicio AT TIME ZONE 'UTC' as fecha_inicio",
        ['Cancelada', reservaFromDb.id],
      )
      reservasCanceladas.push(reservaCancelada)

      const movimiento = {
        usuario_id: reservaCancelada.usuario_id,
        reserva_id: reservaCancelada.id,
        motivo: reservaCancelada.usuario_id !== user.id ? 'Cancelación admin' : 'Cancelación',
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
      const usuarioCancelacion = await db.one('SELECT * FROM Usuarios WHERE id = $1', [
        reservaCancelada.usuario_id,
      ])
      let saldoActualizado = parseFloat(user.saldo) + parseFloat(reservaCancelada.importe)
      await db.one('UPDATE Usuarios SET saldo = $1 WHERE id = $2 RETURNING *', [
        saldoActualizado,
        usuarioCancelacion.id,
      ])
      const pistaFromDb = await db.one('SELECT * FROM Pistas WHERE id = $1', [
        reservaCancelada.pista_id,
      ])
      sendCancelacionEmail(
        usuarioCancelacion.email,
        usuarioCancelacion.nombre,
        reservaCancelada.fecha_inicio,
        pistaFromDb.nombre,
      )
    }

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

function assignTarifa(time, date, slot, tarifas) {
  const slotTime = moment.utc(time)
  const matchingTarifa = tarifas.find((t) => {
    const [tarifaStartHours, tarifaStartMinutes] = t.hora_inicio.split(':').map(Number)
    const [tarifaEndHours, tarifaEndMinutes] = t.hora_fin.split(':').map(Number)
    const tarifaStartTime = moment.utc([
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      tarifaStartHours,
      tarifaStartMinutes,
    ])
    const tarifaEndTime = moment.utc([
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      tarifaEndHours,
      tarifaEndMinutes,
    ])
    return slotTime.isBetween(tarifaStartTime, tarifaEndTime, null, '[]')
  })
  if (matchingTarifa) {
    slot.tarifa = matchingTarifa
  } else {
    slot.tarifa = null
  }
}
