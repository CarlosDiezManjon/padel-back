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
    let pistas = []
    if (user.tipo !== 2) {
      pistas = await db.any('SELECT * FROM Pistas WHERE activo = TRUE ORDER BY nombre ASC')
    } else {
      pistas = await db.any('SELECT * FROM Pistas ORDER BY activo DESC, nombre ASC')
    }

    pistas.forEach((pista) => {
      parseFloatsPista(pista)
    })
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
  if (user.tipo !== 2) {
    return res.status(401).json({
      error: 'No tienes permisos para crear pistas.',
    })
  }
  try {
    //TODO ver como hacer lo de la ubicacion lat lon
    const { nombre, ubicacion, precio, duracion_reserva } = req.body
    const pista = await db.one(
      'INSERT INTO Pistas(nombre, ubicacion, precio, duracion_reserva) VALUES($1, $2, $3, $4) RETURNING *',
      [nombre, ubicacion, precio, duracion_reserva],
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
  if (user.tipo !== 2) {
    return res.status(401).json({
      error: 'No tienes permisos para actualizar pistas.',
    })
  }
  try {
    const { id } = req.params
    const { nombre, ubicacion, lat, lon, precio, duracion_reserva, hora_inicio, hora_fin } =
      req.body
    const pista = await db.one(
      'UPDATE Pistas SET nombre = $1, ubicacion = $2, lat = $3, lon = $4, precio = $5, duracion_reserva = $6, hora_inicio = $7, hora_fin = $8 WHERE activo = TRUE AND id = $9 RETURNING *',
      [nombre, ubicacion, lat, lon, precio, duracion_reserva, hora_inicio, hora_fin, id],
    )
    parseFloatsPista(pista)
    res.json({ success: true, message: 'Pista actualizada', pista })
  } catch (error) {
    logger.error(error)
    res.status(400).json({ error: error.message })
  }
}

exports.deletePista = async (req, res) => {
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
