const emailRegistroTemplate = `<!doctype html>
<head>
    <style>
      .container {
        border-radius: 10px;
        padding: 20px;
        height: 500px;
        width: 80%;
        background: linear-gradient(#404040, #171717);
      }

      h1 {
        text-align: start;
        color: white;
        margin-bottom: 20px;
      }
      .texto{
        margin-top: 20px;
        text-align: start;
        color: white;
      }
      .button {
        margin-left: 40px !important;
        margin-top: 20px !important;
        text-align: center;
        color: white !important;
        text-decoration: none !important;
        background-color: transparent;
        border: 2px solid white;
        border-radius: 5px;
        padding: 10px;
        cursor: pointer;
      }
      .button:hover {
        background-color: white;
        color: black !important;
      }
    </style>
  </head>
    <body>
    <div class="container">
      <h1>Confirmación de email</h1>
      <p class="texto">Hola {{nombre}}, para confirmar su email, haga click en el siguiente enlace:</p>
      <a class="button" href="https://padel-back.onrender.com/confirm-usuario/{{tokenConfirmacion}}">
        Confirmar email
      </a>
    </div>
    </body>
    </html>`

const confirmacionRegistroTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de cuenta PADELAPP</title>
  <style>
      .container {
        border-radius: 10px;
        padding: 20px;
        height: 500px;
        width: 80%;
        background: linear-gradient(#404040, #171717);
      }

      h1 {
        text-align: start;
        color: white;
        margin-bottom: 20px;
      }
      .texto{
        margin-top: 20px;
        text-align: start;
        color: white;
      }
      .button {
        margin-left: 40px !important;
        margin-top: 20px !important;
        text-align: center;
        color: white !important;
        text-decoration: none !important;
        background-color: transparent;
        border: 2px solid white;
        border-radius: 5px;
        padding: 10px;
        cursor: pointer;
      }
      .button:hover {
        background-color: white;
        color: black !important;
      }
    </style>
</head>
<body>
<div class="container">
      <h1>Confirmación de email</h1>
      <p class="texto">Hola {{nombre}}, Confirmación de correo completada.</p>
      <a class="button" href="https://padel-nbx4.onrender.com">
        Acceda a la app
      </a>
    </div>
</body>
</html>
`

const reservaTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva PADELAPP</title>
  <style>
      .container {
        border-radius: 10px;
        padding: 20px;
        height: 500px;
        width: 80%;
        background: linear-gradient(#404040, #171717);
      }

      h1 {
        text-align: start;
        color: white;
        margin-bottom: 20px;
      }
      .texto{
        margin-top: 20px;
        text-align: start;
        color: white;
      }
    </style>
</head>
<body>
<div class="container">
      <h1>Reserva {{fecha}}</h1>
      <p class="texto">Hola {{nombre}}. Reserva confirmada para {{pista}} el {{fecha}} a las {{hora}}</p>
    </div>
</body>
</html>
`

const cancelacionTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cancelación PADELAPP</title>
  <style>
      .container {
        border-radius: 10px;
        padding: 20px;
        height: 500px;
        width: 80%;
        background: linear-gradient(#404040, #171717);
      }
+
      h1 {
        text-align: start;
        color: white;
        margin-bottom: 20px;
      }
      .texto{
        margin-top: 20px;
        text-align: start;
        color: white;
      }
    </style>
</head>
<body>
<div class="container">
      <h1>Reserva {{fecha}}</h1>
      <p class="texto">Hola {{nombre}}. Reserva cancelada para {{pista}} el {{fecha}} a las {{hora}}</p>
    </div>
</body>
</html>
`

module.exports = {
  emailRegistroTemplate,
  confirmacionRegistroTemplate,
  reservaTemplate,
  cancelacionTemplate,
}
