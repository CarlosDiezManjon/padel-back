const pgp = require('pg-promise')()
//const db = pgp('postgres://postgres:postgres@localhost:5432/padelDB');
// const db = pgp(
//   'postgres://padelback:QkT1PUr6uSUHK8F5aJl5imXvCl1W8l8B@dpg-cmjehqacn0vc73dmt9e0-a.frankfurt-postgres.render.com/padeldb_lhji',
// )
const db = pgp({
  host: 'dpg-cmjehqacn0vc73dmt9e0-a.frankfurt-postgres.render.com',
  port: 5432,
  database: 'padeldb_lhji',
  user: 'padelback',
  password: 'QkT1PUr6uSUHK8F5aJl5imXvCl1W8l8B',
  ssl: { rejectUnauthorized: false },
})

module.exports = db
