import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const Pool = pg.Pool



// digital ocean database
const pool = new Pool({
  database: 'postgres',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'ansh00',
})



// // direct database
// const pool = new Pool({
//   database: process.env.SERVER_DB_NAME,
//   host: process.env.SERVER_HOST,
//   port: process.env.SERVER_PORT,
//   user: process.env.SERVER_USER_NAME,
//   password: process.env.SERVER_PASS,
// })

export default pool
