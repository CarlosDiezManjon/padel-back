const db = require('../config/db')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')
const moment = require('moment')
const { parseFloatsPista } = require('../config/utils')

exports.getMovimientos = async (req, res) => {
  try {
    const usuario = await validateUserFromToken(req)
    if (!usuario) {
      return
    }
    const movimientos = await db.any(
      `SELECT m.*, r.fecha_inicio as fecha_reserva, p.nombre AS nombre_pista
             FROM Movimientos m
             INNER JOIN Reservas r ON m.reserva_id = r.id
             INNER JOIN Pistas p ON r.pista_id = p.id
             WHERE m.usuario_id = $1
             ORDER BY m.fecha DESC`,
      [usuario.id],
    )
    return res.status(200).json({ success: true, movimientos })
  } catch (error) {
    logger.error(error)
    return res.status(400).json({
      error: error.message,
    })
  }
}
