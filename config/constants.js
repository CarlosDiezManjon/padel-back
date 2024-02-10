module.exports = {
  SECRET_KEY: 'mcmahon',
  TOKEN_EXPIRATION_TIME: '24h',
  EMAIL: 'noreply.padel.app@gmail.com',
  BASE_URL_BACK:
    process.env.NODE_ENV === 'production'
      ? 'https://padel-back.onrender.com'
      : 'http://localhost:3000',
  BASE_URL_FRONT:
    process.env.NODE_ENV === 'production'
      ? 'https://padel-nbx4.onrender.com'
      : 'http://localhost:5173',
}
