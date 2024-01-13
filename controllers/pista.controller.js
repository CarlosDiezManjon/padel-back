const db = require('../config/db');

exports.getPistas = async (req, res) =>{
    try {
      const pistas = await db.any('SELECT * FROM Pistas WHERE activo = TRUE');
      pistas.forEach(pista => {
        parseFloatsPista(pista);
      });
      console.log(pistas);
      res.json({success: true, pistas});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

exports.createPista = async (req, res) =>{
    try {
      const { nombre, ubicacion, lat, lon, precio, duracion_reserva } = req.body;
      const pista = await db.one('INSERT INTO Pistas(nombre, ubicacion, lat, lon, precio, duracion_reserva) VALUES($1, $2, $3, $4, $5, $6) RETURNING *', [nombre,ubicacion, lat, lon, precio, duracion_reserva]);
      parseFloatsPista(pista);
      res.json({success: true, pista});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
}

exports.updatePista = async (req, res) => {
  try {
      const { id, nombre, ubicacion, lat, lon, precio, duracion_reserva } = req.body;
      const updatedPista = await db.one('UPDATE Pistas SET nombre = $1, ubicacion = $2, lat = $3, lon = $4, precio = $5, duracion_reserva = $6 WHERE activo = TRUE AND id = $7 RETURNING *', [nombre, ubicacion, lat, lon, precio, duracion_reserva, id]);
      parseFloatsPista(updatedPista);
      res.json({success: true, updatedPista});
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

exports.deletePista = async (req, res) => {
  try {
      const { id } = req.params;
      const reserva = await db.any('SELECT * FROM Reservas WHERE pista_id = $1 AND estado = $2', [id, 'pendiente']);
      if (reserva.length === 0) {
          await db.none('UPDATE Pistas SET activo=FALSE WHERE id = $1', [id]);
          res.json({success: true, message: 'Pista eliminada correctamente.'});
      } else {
          res.status(400).json({ error: 'Hay reservas pendientes aún.' });
      }
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

exports.activatePista = async (req, res) => {
  try {
      const { id } = req.params;
      const pista = await db.one('UPDATE Pistas SET activo=TRUE WHERE id = $1 RETURNING *', [id]);
      parseFloatsPista(pista);
      res.json({success: true, pista});
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

function parseFloatsPista(pista) {
  pista.lat = parseFloat(pista.lat);
  pista.lon = parseFloat(pista.lon);
  pista.precio = parseFloat(pista.precio);
  pista.duracion_reserva = parseFloat(pista.duracion_reserva);
  return pista;
}
