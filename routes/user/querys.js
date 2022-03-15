import pool from '../../db.js'

function createNewUser(data) {
	const { id, username, display_name, email, avatar_url, backdrop_url, bio } =
		data
	return pool.query(
		`insert into users (id, username, display_name, email, avatar_url, backdrop_url, bio) values ($1, $2, $3, $4, $5, $6, $7)`,
		[id, username, display_name, email, avatar_url, backdrop_url, bio]
	)
}
function getUser(id, isUsername) {
	if (isUsername) {
		return pool.query(`select * from users where username = $1`, [id])
	} else {
		return pool.query(`select * from users where id = $1`, [id])
	}
}

export { createNewUser, getUser }
