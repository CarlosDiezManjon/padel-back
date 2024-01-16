const pgp = require('pg-promise')()
//const db = pgp('postgres://postgres:postgres@localhost:5432/padelDB');
const db = pgp(
  'postgres://padelback:QkT1PUr6uSUHK8F5aJl5imXvCl1W8l8B@dpg-cmjehqacn0vc73dmt9e0-a.frankfurt-postgres.render.com/padeldb_lhji',
)

module.exports = db
