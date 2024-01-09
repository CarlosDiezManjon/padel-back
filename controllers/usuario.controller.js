const db = require('../config/db');
exports.getUsers = async (req, res) =>{
  try {
    const usuarios = await db.any('SELECT * FROM Usuarios');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
}

exports.getUserByUsername = async (req, res) =>{
  try {
    const { username } = req.params;
    const usuario = await db.one('SELECT * FROM Usuarios WHERE username = $1', [username]);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario por nombre de usuario.' });
  }
}

