const db = require('../config/db');

exports.getPistas = async (req, res) =>{
    try {
      const pistas = await db.any('SELECT * FROM Pistas');
      res.json({success: true, pistas});
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener pistas.' });
    }
  }

exports.createPista = async (req, res) =>{
    try {
      const { nombre, ubicacion, foto, precio, duracion_reserva } = req.body;
      await db.none('INSERT INTO Pistas(nombre, ubicacion, foto, precio, duracion_reserva) VALUES($1, $2, $3, $4, $5)', [nombre,ubicacion, foto, precio, duracion_reserva]);
      console.log(req.body)
      res.json({success: true, pistas});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
}