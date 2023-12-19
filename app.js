const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configura body-parser para analizar JSON
app.use(bodyParser.json());

// Conexión a la base de datos PostgreSQL
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:postgres@localhost:5432/padel-db');

// Rutas para la gestión de Usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await db.any('SELECT * FROM Usuarios');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

app.post('/usuarios', async (req, res) => {
  const { nombre, apellido, correoElectronico, telefono, tipoUsuario, nivel } = req.body;
  try {
    await db.none('INSERT INTO Usuarios (Nombre, Apellido, CorreoElectronico, Telefono, TipoUsuario, Nivel) VALUES ($1, $2, $3, $4, $5, $6)', [nombre, apellido, correoElectronico, telefono, tipoUsuario, nivel]);
    res.json({ message: 'Usuario creado con éxito.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario.' });
  }
});

// Rutas para la gestión de Partidos
app.get('/partidos', async (req, res) => {
  try {
    const partidos = await db.any('SELECT * FROM Partidos');
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener parsdftidos.' });
  }
});

app.post('/partidos', async (req, res) => {
  const { pistaID, organizadorID, fechaHoraPartido, capacidadMaxima, descripcion, nivel, resultado } = req.body;
  try {
    await db.none('INSERT INTO Partidos (PistaID, OrganizadorID, FechaHoraPartido, CapacidadMaxima, Descripcion, Nivel, Resultado) VALUES ($1, $2, $3, $4, $5, $6, $7)', [pistaID, organizadorID, fechaHoraPartido, capacidadMaxima, descripcion, nivel, resultado]);
    res.json({ message: 'Partido creado con éxito.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear partido.' });
  }
});

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`);
});