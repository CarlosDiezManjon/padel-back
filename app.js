const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const port = 3000

app.use(bodyParser.json())

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://padel-nbx4.onrender.com'],
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

const usuarioRoutes = require('./routes/usuario.routes')
const pistaRoutes = require('./routes/pista.routes')
const reservaRoutes = require('./routes/reserva.routes')
const movimientoRoutes = require('./routes/movimiento.routes')
const tarifaRoutes = require('./routes/tarifa.routes')
const actividadRoutes = require('./routes/actividad.routes')

app.use('', usuarioRoutes)
app.use('', pistaRoutes)
app.use('', reservaRoutes)
app.use('', movimientoRoutes)
app.use('', tarifaRoutes)
app.use('', actividadRoutes)

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`)
})
