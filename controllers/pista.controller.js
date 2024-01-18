const db = require('../config/db')
const { validateUserFromToken } = require('../config/token.validation')

exports.getPistas = async (req, res) => {
  const user = await validateUserFromToken(req, res)
  if (!user) {
    return
  }
  try {
    let pistas = []
    if (user.tipo !== 2) {
      pistas = await db.any('SELECT * FROM Pistas WHERE activo = TRUE')
    } else {
      pistas = await db.any('SELECT * FROM Pistas')
    }

    pistas.forEach((pista) => {
      parseFloatsPista(pista)
    })
    res.json({ success: true, pistas })
  } catch (error) {
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
    res.json({ success: true, pista })
  } catch (error) {
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
    const { nombre, ubicacion, lat, lon, precio, duracion_reserva } = req.body
    const pista = await db.one(
      'UPDATE Pistas SET nombre = $1, ubicacion = $2, lat = $3, lon = $4, precio = $5, duracion_reserva = $6 WHERE activo = TRUE AND id = $7 RETURNING *',
      [nombre, ubicacion, lat, lon, precio, duracion_reserva, id],
    )
    parseFloatsPista(pista)
    res.json({ success: true, pista })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.deletePista = async (req, res) => {
  try {
    const { id } = req.params
    const reserva = await db.any('SELECT * FROM Reservas WHERE pista_id = $1 AND estado = $2', [
      id,
      'pendiente',
    ])
    if (reserva.length === 0) {
      const pista = await db.one('UPDATE Pistas SET activo=FALSE WHERE id = $1 RETURNING *', [id])
      parseFloatsPista(pista)
      res.json({ success: true, pista })
    } else {
      res.status(400).json({ error: 'Hay reservas pendientes aún.' })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.activatePista = async (req, res) => {
  try {
    const { id } = req.params
    const pista = await db.one('UPDATE Pistas SET activo=TRUE WHERE id = $1 RETURNING *', [id])
    parseFloatsPista(pista)
    res.json({ success: true, pista })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

function parseFloatsPista(pista) {
  pista.lat = parseFloat(pista.lat)
  pista.lon = parseFloat(pista.lon)
  pista.precio = parseFloat(pista.precio)
  pista.duracion_reserva = parseFloat(pista.duracion_reserva)
  return pista
}
