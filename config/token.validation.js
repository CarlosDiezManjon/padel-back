const jwt = require('jsonwebtoken')
const db = require('../config/db')
const { SECRET_KEY } = require('./constants')

function validateUserFromToken(req, res) {
  const token = req.headers.authorization.split(' ')[1]
  try {
    const decodedToken = jwt.verify(token, SECRET_KEY, { ignoreExpiration: false })

    // Check if the token is expired
    // const isTokenExpired = Date.now() >= decodedToken.exp * 1000
    // if (isTokenExpired) {
    //   res.status(401).json({ error: 'Token expired' })
    //   return
    // }

    // Check if the user exists in the database and is active
    const user = db.oneOrNone('SELECT * FROM Usuarios WHERE activo = true and username = $1', [
      decodedToken.username,
    ])
    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' })
      return
    }

    return decodedToken
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
module.exports = {
  validateUserFromToken,
}
