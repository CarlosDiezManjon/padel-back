const db = require('../config/db')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')
const moment = require('moment')

exports.getTarifas = async (req, res) => {
  const usuario = await validateUserFromToken(req, res)
  if (!usuario) {
    return
  }
  try {
    const tarifas = await db.any('SELECT * FROM Tarifas ORDER BY id ASC')
    return res.status(200).json({ success: true, tarifas })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}

exports.getTarifaById = async (req, res) => {
  const usuario = await validateUserFromToken(req, res)
  if (!usuario) {
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

exports.createTarifa = async (req, res) => {
  const usuario = await validateUserFromToken(req, res)
  if (!usuario) {
    return
  }
  try {
    const { nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario } = req.body
    const tarifa = await db.none(
      'INSERT INTO Tarifas (nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario) VALUES ($1, $2, $3, $4, $5, $6)',
      [nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario],
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
  const usuario = await validateUserFromToken(req, res)
  if (!usuario) {
    return
  }
  try {
    const { id } = req.params
    const { nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario } = req.body
    const tarifa = await db.one(
      'UPDATE Tarifas SET nombre = $1, tipo_dia = $2, hora_inicio = $3, hora_fin = $4, precio = $5, tipo_usuario = $6 WHERE id = $7 RETURNING *',
      [nombre, tipo_dia, hora_inicio, hora_fin, precio, tipo_usuario, id],
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
  const usuario = await validateUserFromToken(req, res)
  if (!usuario) {
    return
  }
  try {
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
  const usuario = await validateUserFromToken(req, res)
  if (!usuario) {
    return
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
