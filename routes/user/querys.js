import pool from '../../db.js'

function createNewUser(data) {
	const {
		id,
		username,
		display_name,
		email,
		avatar_url,
		backdrop_url,
		bio,
		token_id,
	} = data
	return pool.query(
		`insert into users (id, username, display_name, email, avatar_url, backdrop_url, bio,token_id) values ($1, $2, $3, $4, $5, $6, $7,$8)`,
		[id, username, display_name, email, avatar_url, backdrop_url, bio, token_id]
	)
}
function getUser(id, isUsername, username) {
	if (isUsername) {
		return pool.query(
			`select *,(exists  (select 1 from followers
			where followers.user_id=users.username and followers.follower_id ='${username}')
		     ) as isfollow from users where users.username = $1`,
			[id]
		)
	} else {
		return pool.query(
			`select *,(exists  (select 1 from followers
			where followers.user_id=users.username and followers.follower_id ='${username}')
		     ) as isfollow from users where id = $1`,
			[id]
		)
	}
}

export { createNewUser, getUser }
