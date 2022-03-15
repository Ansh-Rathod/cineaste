import pg from 'pg'

const Pool = pg.Pool

// to use ssl database from url
// const pool = new Pool({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: {
// 		rejectUnauthorized: false,
// 	},
// })

// // to use local database
const pool = new Pool({
	database: 'cineaste',
	host: 'localhost',
	port: 5432,
	user: 'ansh',
	password: 'ansh00',
})

export default pool
