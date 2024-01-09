const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configura body-parser para analizar JSON
app.use(bodyParser.json());

// Conexión a la base de datos PostgreSQL
const usuarioRoutes = require('./routes/usuario.routes');
const pistasRoutes = require('./routes/pistas.routes');
app.use('', usuarioRoutes);
app.use('', pistasRoutes);


app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`);
});