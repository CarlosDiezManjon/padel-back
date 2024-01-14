const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const port = 3000

app.use(bodyParser.json())
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

const usuarioRoutes = require('./routes/usuario.routes')
const pistasRoutes = require('./routes/pistas.routes')
app.use('', usuarioRoutes)
app.use('', pistasRoutes)

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`)
})
