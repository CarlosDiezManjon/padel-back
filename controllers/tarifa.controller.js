const db = require('../config/db')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')
const moment = require('moment')

exports.getTarifas = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const tarifas = await db.any(`
      SELECT t.*, a.nombre AS actividad_nombre
      FROM Tarifas t
      LEFT JOIN Actividades a ON t.actividad_id = a.id
      ORDER BY t.id ASC
    `)
    return res.status(200).json({ success: true, tarifas })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.getTarifaById = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const { id } = req.params
    const tarifa = await db.one('SELECT * FROM Tarifas WHERE id = $1', [id])
    return res.status(200).json({ success: true, tarifa })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.getTarifaActual = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const { fecha, tipo_usuario, tipo_actividad } = req.query
    const isWeekend = moment.utc(fecha).isoWeekday() > 5
    let tipo_dia = 'SEMANA'
    if (isWeekend) {
      tipo_dia === 'FINDE'
    }
    const tarifa = await db.one(
      "SELECT * FROM Tarifas WHERE (tipo_dia = 'TODO' OR tipo_dia = $1) AND hora_inicio <= $2 AND hora_fin >= $2 AND activo = true AND tipo_usuario = $3 AND actividad_id = $4 ORDER BY id DESC LIMIT 1",
      [tipo_dia, moment(fecha).format('HH:mm:ss'), tipo_usuario, tipo_actividad],
    )
    return res.status(200).json({ success: true, tarifa })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.createTarifa = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para crear tarifas.',
    })
  }
  try {
    const { nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario, actividad_id } = req.body
    const tarifa = await db.one(
      'INSERT INTO Tarifas (nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario, actividad_id, activo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario, actividad_id, true],
    )

    return res.status(200).json({ success: true, tarifa })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.updateTarifa = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para actualizar tarifas.',
    })
  }
  try {
    const { id } = req.params
    const { nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario, actividad_id } = req.body
    const tarifa = await db.one(
      'UPDATE Tarifas SET nombre = $1, tipo_dia = $2, hora_inicio = $3, hora_fin = $4, precio = $5, tipo_usuario = $6, actividad_id = $7 WHERE id = $8 RETURNING *',
      [nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario, actividad_id, id],
    )
    return res.status(200).json({ success: true, tarifa })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.deactivateTarifa = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para desactivar tarifas.',
    })
  }
  try {
    //TODO: Validar que no haya reservas con esta tarifa
    const { id } = req.params
    const tarifa = await db.one('UPDATE Tarifas SET activo = false WHERE id = $1 RETURNING *', [id])
    return res.status(200).json({ success: true, tarifa })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.activateTarifa = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para activar tarifas.',
    })
  }
  try {
    const { id } = req.params
    const tarifa = await db.one('UPDATE Tarifas SET activo = true WHERE id = $1 RETURNING *', [id])
    return res.status(200).json({ success: true, tarifa })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}
