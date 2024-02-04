const registroTemplate = `<!doctype html>
<head>
    <style>
    .container {
      border-radius: 10px;
      padding: 20px;
      height: 500px;
      width: 80%;
    }

    h1 {
      text-align: start;
      color: black;
      margin-bottom: 20px;
    }
    .texto{
      margin-top: 20px;
      text-align: start;
      color: black;
    }
    .button {
      margin-left: 40px !important;
      margin-top: 20px !important;
      text-align: center;
      color: black !important;
      text-decoration: none !important;
      background-color: transparent;
      border: 2px solid black;
      border-radius: 5px;
      padding: 10px;
      cursor: pointer;
    }
    .button:hover {
      border: 2px solid white !important;
      background-color: transparent !important;
      color: white !important;
    }
    </style>
  </head>
    <body>
    <div class="container">
      <h1>Confirmación de email</h1>
      <p class="texto">Hola {{nombre}}, para confirmar su email, haga click en el siguiente enlace:</p>
      <a class="button" href="{{baseUrl}}/confirm-usuario/{{tokenConfirmacion}}">
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
      }

      h1 {
        text-align: start;
        color: black;
        margin-bottom: 20px;
      }
      .texto{
        margin-top: 20px;
        text-align: start;
        color: black;
      }
      .button {
        margin-left: 40px !important;
        margin-top: 20px !important;
        text-align: center;
        color: black !important;
        text-decoration: none !important;
        background-color: transparent;
        border: 2px solid black;
        border-radius: 5px;
        padding: 10px;
        cursor: pointer;
      }
      .button:hover {
        border: 2px solid white !important;
        background-color: transparent !important;
        color: white !important;
      }
    </style>
</head>
<body>
<div class="container">
      <h1>Confirmación de email</h1>
      <p class="texto">Hola {{nombre}}, Confirmación de correo completada.</p>
      <a class="button" href="{{baseUrl}}">
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
      }

      h1 {
        text-align: start;
        color: black;
        margin-bottom: 20px;
      }
      .texto{
        margin-top: 20px;
        text-align: start;
        color: black;
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
      }
+
      h1 {
        text-align: start;
        color: black;
        margin-bottom: 20px;
      }
      .texto{
        margin-top: 20px;
        text-align: start;
        color: black;
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

const cambioEmailTemplate = `<!doctype html>
<head>
    <style>
    .container {
      border-radius: 10px;
      padding: 20px;
      height: 500px;
      width: 80%;
    }

    h1 {
      text-align: start;
      color: black;
      margin-bottom: 20px;
    }
    .texto{
      margin-top: 20px;
      text-align: start;
      color: black;
    }
    .button {
      margin-left: 40px !important;
      margin-top: 20px !important;
      text-align: center;
      color: black !important;
      text-decoration: none !important;
      background-color: transparent;
      border: 2px solid black;
      border-radius: 5px;
      padding: 10px;
      cursor: pointer;
    }
    .button:hover {
      border: 2px solid white !important;
      background-color: transparent !important;
      color: white !important;
    }
    </style>
  </head>
    <body>
    <div class="container">
      <h1>Confirmación de email</h1>
      <p class="texto">Hola {{nombre}}, para confirmar su nuevo email, haga click en el siguiente enlace:</p>
      <a class="button" href="{{baseUrl}}/confirm-email/{{tokenConfirmacion}}">
        Confirmar email
      </a>
    </div>
    </body>
    </html>`

module.exports = {
  registroTemplate,
  confirmacionRegistroTemplate,
  reservaTemplate,
  cancelacionTemplate,
  cambioEmailTemplate,
}
