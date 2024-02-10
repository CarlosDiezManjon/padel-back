const db = require('../config/db')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')
const moment = require('moment')

exports.getActividades = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const actividades = await db.any('SELECT * FROM Actividades ORDER BY nombre ASC')
    return res.status(200).json({ success: true, actividades })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.getActividadById = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const { id } = req.params
    const actividad = await db.one('SELECT * FROM Actividades WHERE id = $1', [id])
    return res.status(200).json({ success: true, actividad })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.createActividad = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para crear actividades.',
    })
  }
  const { nombre, descripcion } = req.body
  try {
    const actividad = await db.one(
      'INSERT INTO Actividades (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, true],
    )
    return res.status(200).json({ success: true, actividad })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.updateActividad = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para actualizar actividades.',
    })
  }
  const { id } = req.params
  const { nombre, descripcion } = req.body
  try {
    const actividad = await db.one(
      'UPDATE Actividades SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id],
    )
    return res.status(200).json({ success: true, actividad })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.deactivateActividad = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para desactivar actividades.',
    })
  }
  const { id } = req.params
  try {
    const actividad = await db.one(
      'UPDATE Actividades SET activo = false WHERE id = $1 RETURNING *',
      [id],
    )
    return res.status(200).json({ success: true, actividad })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.activateActividad = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para activar actividades.',
    })
  }
  const { id } = req.params
  try {
    const actividad = await db.one(
      'UPDATE Actividades SET activo = true WHERE id = $1 RETURNING *',
      [id],
    )
    return res.status(200).json({ success: true, actividad })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}
