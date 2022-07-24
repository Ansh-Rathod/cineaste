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
		device_id,
	} = data
	return pool.query(
		`insert into users (id, username, display_name, email, avatar_url, backdrop_url, bio,token_id,device_id) values ($1, $2, $3, $4, $5, $6, $7,$8,$9)`,
		[
			id,
			username.toLowerCase(),
			display_name,
			email,
			avatar_url,
			backdrop_url,
			bio,
			token_id,
			device_id,
		]
	)
}
function getUser(id, isUsername, username) {
	if (isUsername) {
		return pool.query(
			`select *,(exists  (select 1 from followers
			where followers.user_id=users.username and followers.follower_id ='${username}')
		     ) as isfollow,
			(select count(*) from reviews where creator_username =users.username) as review_count, 
			(select count(*) from watchlist where username =users.username) as watchlist_count,	 
			(select count(*) from favorites where username =users.username) as favorites_count,	 
			(select count(*) from watched where username =users.username) as watched_count	 
				 from users where users.username = $1`,
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
