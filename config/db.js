const pgp = require('pg-promise')()
// const db = pgp('postgres://postgres:postgres@localhost:5432/padelDB')
let db

if (process.env.NODE_ENV === 'production') {
  db = pgp({
    host: 'dpg-cmjehqacn0vc73dmt9e0-a.frankfurt-postgres.render.com',
    port: 5432,
    database: 'padeldb_lhji',
    user: 'padelback',
    password: 'QkT1PUr6uSUHK8F5aJl5imXvCl1W8l8B',
    ssl: { rejectUnauthorized: false },
  })
} else {
  db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'padelDB',
    user: 'padelback',
    password: 'padelback',
  })
}

module.exports = db
