const crypto = require('crypto')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')

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
        <!-- Rest of your HTML template... -->
        http://localhost:3000/confirm-usuario/{{tokenConfirmacion}}
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
        console.log('Error sending email:', error)
        reject(false)
      } else {
        console.log('Email sent:', info.response)
        resolve(true)
      }
    })
  })
}

function cifrarPassword(password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

module.exports = {
  generarCodigoRegistro,
  sendConfirmationEmail,
  cifrarPassword,
}
