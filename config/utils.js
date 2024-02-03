const crypto = require('crypto')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const logger = require('./logger')

function generarCodigoRegistro() {
  const caracteresPermitidos = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let stringAleatorio = ''

  for (let i = 0; i < 16; i++) {
    const caracterAleatorio = caracteresPermitidos.charAt(
      crypto.randomInt(caracteresPermitidos.length),
    )
    stringAleatorio += caracterAleatorio
  }

  return stringAleatorio
}
function remplazarParametros(plantilla, parametros) {
  for (const [clave, valor] of Object.entries(parametros)) {
    const expresionRegular = new RegExp(`{{${clave}}}`, 'g')
    plantilla = plantilla.replace(expresionRegular, valor)
  }
  return plantilla
}

function sendConfirmationEmail(to_address, tokenConfirmacion) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'noreply.padel.app@gmail.com',
      pass: 'devo oqyr qpjd uhpe',
    },
  })
  return new Promise((resolve, reject) => {
    const htmlTemplate = `<!doctype html>
    <head>
        <style>
          body {
            background: "linear-gradient(#404040, #171717);"
          }

          h1 {
            text-align: center;
            color: white;
          }
          p {
            text-align: center;
            color: white;
          }
        </style>
      </head>
        <body >
        <h1>Confirmación de email</h1>
        <p>
        https://padel-back.onrender.com/confirm-usuario/{{tokenConfirmacion}}
        </p>
        </body>
        </html>`
    const parametros = {
      tokenConfirmacion: tokenConfirmacion,
    }
    const html = remplazarParametros(htmlTemplate, parametros)

    const mailOptions = {
      from: 'noreply.padel.app@gmail.com',
      to: to_address,
      subject: 'PadelApp Email Confirmation',
      html: html,
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error('Error sending email:', error)
        reject(false)
      } else {
        logger.info('Email sent:', to_address)
        resolve(true)
      }
    })
  })
}

function cifrarPassword(password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

function parseFloatsPista(pista) {
  pista.lat = parseFloat(pista.lat)
  pista.lon = parseFloat(pista.lon)
  pista.precio = parseFloat(pista.precio)
  pista.duracion_reserva = parseFloat(pista.duracion_reserva)
  return pista
}

module.exports = {
  generarCodigoRegistro,
  sendConfirmationEmail,
  cifrarPassword,
  parseFloatsPista,
}
