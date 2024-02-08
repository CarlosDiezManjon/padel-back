const db = require('../config/db')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const { validateUserFromToken } = require('../config/token.validation')

exports.getMovimientos = async (req, res) => {
  const usuario = await validateUserFromToken(req, res)
  if (!usuario) {
    return
  }
  try {
    const movimientos = await db.any(
      `SELECT m.*, (m.fecha AT TIME ZONE 'UTC') as fecha,(r.fecha_inicio AT TIME ZONE 'UTC') as fecha_inicio_reserva,(r.fecha_fin AT TIME ZONE 'UTC') as fecha_fin_reserva, p.nombre AS nombre_pista
         FROM Movimientos m
         LEFT JOIN Reservas r ON m.reserva_id = r.id
         LEFT JOIN Pistas p ON r.pista_id = p.id
         WHERE m.usuario_id = $1
         ORDER BY m.fecha DESC, m.id DESC`,
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
