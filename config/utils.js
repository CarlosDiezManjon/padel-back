const crypto = require('crypto')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const logger = require('./logger')
const constants = require('./constants')
const moment = require('moment-timezone')

const {
  confirmacionRegistroTemplate,
  reservaTemplate,
  cancelacionTemplate,
} = require('./mailTemplates')

function dateUTCToLocalTime(date) {
  if (!date) {
    return ''
  }

  const utcDate = moment.utc(date)
  const localDateStr = utcDate.tz('Europe/Madrid').format('HH:mm')

  return localDateStr
}

function dateUTCToLocalDateOnly(date) {
  if (!date) {
    return ''
  }

  const utcDate = moment.utc(date)
  const localDateStr = utcDate.tz('Europe/Madrid').format('DD MM YYYY')

  return localDateStr
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply.padel.app@gmail.com',
    pass: 'devo oqyr qpjd uhpe',
  },
})

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

function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error('Error sending email:', error)
        reject(false)
      } else {
        logger.info('Email sent:', mailOptions.to)
        resolve(true)
      }
    })
  })
}

function sendConfirmationEmail(to_address, tokenConfirmacion) {
  const parametros = {
    tokenConfirmacion: tokenConfirmacion,
  }
  const html = remplazarParametros(confirmacionRegistroTemplate, parametros)

  const mailOptions = {
    from: constants.EMAIL,
    to: to_address,
    subject: 'PadelApp Email Confirmation',
    html: html,
  }
  return sendEmail(mailOptions)
}

function sendReservaEmail(to_address, nombre, fecha, pista) {
  const parametros = {
    nombre: nombre,
    fecha: dateUTCToLocalDateOnly(fecha),
    hora: dateUTCToLocalTime(fecha),
    pista: pista,
  }
  const html = remplazarParametros(reservaTemplate, parametros)

  const mailOptions = {
    from: constants.EMAIL,
    to: to_address,
    subject: 'Reserva confirmada',
    html: html,
  }
  return sendEmail(mailOptions)
}

function sendCancelacionEmail(to_address, nombre, fecha, pista) {
  const parametros = {
    nombre: nombre,
    fecha: dateUTCToLocalDateOnly(fecha),
    hora: dateUTCToLocalTime(fecha),
    pista: pista,
  }
  const html = remplazarParametros(cancelacionTemplate, parametros)

  const mailOptions = {
    from: constants.EMAIL,
    to: to_address,
    subject: 'Cancelación de reserva',
    html: html,
  }
  return sendEmail(mailOptions)
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
  sendReservaEmail,
  sendCancelacionEmail,
}
