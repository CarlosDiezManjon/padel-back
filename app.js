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
const pistasRoutes = require('./routes/pistas.routes')
const reservaRoutes = require('./routes/reserva.routes')
const movimientoRoutes = require('./routes/movimiento.routes')
const tarifasRoutes = require('./routes/tarifas.routes')

app.use('', usuarioRoutes)
app.use('', pistasRoutes)
app.use('', reservaRoutes)
app.use('', movimientoRoutes)
app.use('', tarifasRoutes)

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`)
})
