import pg from 'pg'

const Pool = pg.Pool

// to use ssl database from url
// const pool = new Pool({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: {
// 		rejectUnauthorized: false,
// 	},
// })

// digital ocean database
const pool = new Pool({
  database: 'postgres',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'ansh00',
})

// // local databale
// const pool = new Pool({
//   database: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   user: 'postgres',
//   password: 'ansh00',
// })

// // direct database
// const pool = new Pool({
// 	database: 'postgres',
// 	host: '143.110.247.159',
// 	port: 5432,
// 	user: 'postgres',
// 	password: 'ansh00',
// })

export default pool
