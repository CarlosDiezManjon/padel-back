const db = require('../config/db')
const { validateUserFromToken } = require('../config/token.validation')
const { parseFloatsPista } = require('../config/utils')
const logger = require('../config/logger')

exports.getPistas = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const pistas = await db.any(
      'SELECT p.*, a.nombre AS actividad_nombre FROM Pistas p JOIN Actividades a ON p.actividad_id = a.id',
    )
    pistas.forEach(parseFloatsPista)
    res.json({ success: true, pistas })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.getPistaById = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    const { id } = req.params
    const pista = await db.one('SELECT * FROM Pistas WHERE id = $1', [id])
    parseFloatsPista(pista)
    res.json({ success: true, pista })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.createPista = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para crear pistas.',
    })
  }
  try {
    //TODO ver como hacer lo de la ubicacion lat lon
    const { nombre, ubicacion, duracion_reserva, hora_inicio, hora_fin, actividad_id } = req.body
    const actividad = await db.one('SELECT * FROM Actividades WHERE id = $1', [actividad_id])
    if (!actividad) {
      return res.status(200).json({ error: 'La actividad no existe' })
    }

    const pista = await db.one(
      'INSERT INTO Pistas(nombre, ubicacion, duracion_reserva, hora_inicio, hora_fin, actividad_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, ubicacion, duracion_reserva, hora_inicio, hora_fin, actividad_id],
    )
    parseFloatsPista(pista)
    res.json({ success: true, message: 'Pista creada', pista })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.updatePista = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  if (user.tipo !== 0) {
    return res.status(401).json({
      error: 'No tienes permisos para actualizar pistas.',
    })
  }
  try {
    const { id } = req.params
    const { nombre, ubicacion, duracion_reserva, hora_inicio, hora_fin, actividad_id } = req.body
    const pista = await db.one(
      'UPDATE Pistas SET nombre = $1, ubicacion = $2, duracion_reserva = $3, hora_inicio = $4, hora_fin = $5, actividad_id = $6 WHERE id = $7 RETURNING *',
      [nombre, ubicacion, duracion_reserva, hora_inicio, hora_fin, actividad_id, id],
    )
    parseFloatsPista(pista)
    res.json({ success: true, message: 'Pista actualizada', pista })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.deactivatePista = async (req, res) => {
  try {
    const { id } = req.params
    const reserva = await db.any(
      "SELECT * FROM Reservas WHERE pista_id = $1 AND fecha_fin >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC'",
      [id],
    )
    if (reserva.length === 0) {
      const pista = await db.one('UPDATE Pistas SET activo=FALSE WHERE id = $1 RETURNING *', [id])
      parseFloatsPista(pista)
      res.json({ success: true, message: 'Pista desactivada', pista })
    } else {
      res.status(400).json({ error: 'Hay reservas pendientes aún.' })
    }
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.activatePista = async (req, res) => {
  try {
    const { id } = req.params
    const pista = await db.one('UPDATE Pistas SET activo=TRUE WHERE id = $1 RETURNING *', [id])
    parseFloatsPista(pista)
    res.json({ success: true, message: 'Pista activada', pista })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}
