import axios from 'axios'
import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
import { createNewUser, getUser } from './querys.js'
const router = express.Router()

router.post(
	'/new',
	asyncHandler(async (req, res, next) => {
		const { rows } = await getUser(req.body.id, false)
		if (rows.length == 0) {
			await pool.query(
				`update users set token_id = 'null' where lower(device_id) = $1`,
				[req.body.device_id.toLowerCase()]
			)

			await createNewUser(req.body)

			res.status(201).json({
				success: true,
				status: 201,
				message: 'User created successfully',
				results: await (await getUser(req.body.id, false)).rows[0],
			})
		} else {
			await pool.query(
				`update users set token_id = 'null' where lower(device_id) = $1`,
				[req.body.device_id.toLowerCase()]
			)
			await pool.query(
				`update users set token_id = $1, device_id= $3 where id = $2;`,
				[req.body.token_id, req.body.id, req.body.device_id]
			)

			res.status(200).json({
				success: true,
				status: 200,
				message: 'Successfully login.',
				results: rows[0],
			})
		}
	})
)

async function sendNotification(id, heading, body, icon) {
	await axios({
		method: 'POST',
		url: `https://onesignal.com/api/v1/notifications`,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		data: {
			app_id: '52598804-8cac-4a63-a7f4-c9d642679986',
			include_player_ids: [id],
			android_accent_color: 'FFB319',
			small_icon: 'ic_stat_onesignal_default',
			large_icon: icon,
			headings: {
				en: heading,
			},
			contents: {
				en: body,
			},
		},
	})
}

router.get(
	'/:id',
	asyncHandler(async (req, res, next) => {
		const { rows } = await getUser(req.params.id, true, req.query.username)
		res.status(200).json({ success: true, results: rows[0] ?? {} })
	})
)
router.get(
	'/counts/:id',
	asyncHandler(async (req, res, next) => {
		const { rows } = await pool.query(`
      select
			(select count(*) from watchlist where username =users.username) as watchlist_count,	 
			(select count(*) from favorites where username =users.username) as favorites_count,	 
			(select count(*) from watched where username =users.username) as watched_count from users where username = $1;`, [req.params.id]
		)

		res.status(200).json({ success: true, results: rows[0] ?? {} })
	})
)

router.put(
	'/username/check',
	asyncHandler(async (req, res, next) => {
		const { username } = req.query
		const { rows } = await pool.query(
			'select exists(select 1 from users where lower(username)=$1)',

			[username]
		)
		res.status(200).json({ success: true, results: rows[0] })
	})
)

router.put(
	'/username/update',
	asyncHandler(async (req, res, next) => {
		const { username, id } = req.query
		const { rows } = await pool.query(
			'update users set username=$1 where id=$2 returning *',

			[username, id]
		)
		res.status(200).json({ success: true, results: rows[0] })
	})
)

router.post(
	'/follow/one',
	asyncHandler(async (req, res, next) => {
		const { user_id, follower_id } = req.body

		const { rows } = await pool.query(
			'insert into followers (user_id,follower_id) values($1,$2)',
			[user_id, follower_id]
		)

		const data = await pool.query(
			`select token_id,
			(select display_name from users where username = $2) as name,
		(select avatar_url from users where username = $2) as avatar_url
			from users where username = $1`,
			[user_id, follower_id]
		)
		if (data.rows[0].token_id !== 'null') {
			console.log(data.rows[0].token_id)

			await sendNotification(
				data.rows[0].token_id,
				'@' + follower_id,
				`${data.rows[0].name} started following you`,
				data.rows[0].avatar_url
			)
		}
		res.status(200).json({ success: true, results: rows[0] })
	})
)
router.post(
	'/unfollow/one',
	asyncHandler(async (req, res, next) => {
		const { user_id, follower_id } = req.body

		const { rows } = await pool.query(
			'delete from followers where user_id =$1 and follower_id=$2;',
			[user_id, follower_id]
		)
		res.status(200).json({ success: true, results: rows[0] })
	})
)
router.get(
	'/following/:id',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query
		const offset = (page ?? 0) * 20

		const { rows } = await pool.query(
			`
		select users.id, users.username, users.display_name, users.avatar_url,
	critic,

	(exists(select 1 from followers
		where followers.user_id = users.username
		and followers.follower_id = '${username}')
	) as isfollow
		from followers left join users 
		on followers.user_id = users.username where follower_id = $1 
		order by isfollow desc offset $2 limit 20`,
			[req.params.id, offset]
		)
		res.status(200).json({ success: true, results: rows })
	})
)
router.get(
	'/followers/:id',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query
		const offset = (page ?? 0) * 20

		const { rows } = await pool.query(
			`
			select users.id, users.username, users.display_name, users.avatar_url,
	critic,
	(exists(select 1 from followers
							where followers.user_id = users.username
					    and followers.follower_id = '${username}')
	) as isfollow
			from followers left join users 
			on followers.follower_id = users.username where user_id = $1 
			order by isfollow desc offset $2 limit 20; `,
			[req.params.id, offset]
		)
		res.status(200).json({ success: true, results: rows })
	})
)

router.get(
	'/suggested/:username',
	asyncHandler(async (req, res, next) => {
		const { username } = req.params
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select username, display_name, avatar_url,
	critic,
	(exists(select 1 from followers
			where followers.user_id = users.username
			and followers.follower_id = '${username}')) as isfollow
			from users 
                  where username not in
	(select user_id from followers where follower_id = '${username}') and
		(select count(*) from reviews where creator_username = users.username) > 0	
			order by random() limit 20; `
		)
		res.status(200).json({ success: true, results: rows })
	})
)

router.post(
	'/update/profile',
	asyncHandler(async (req, res, next) => {
		const { name, bio, backdrop, profile, username } = req.body
		await pool.query(
			`update users set
display_name = $1,
	avatar_url = $2,
	backdrop_url = $3,
	bio = $4 
			where username = $5
	`,
			[name, profile, backdrop, bio, username]
		)
		res.status(200).json({ success: true })
	})
)

router.post(
	'/update/bg',
	asyncHandler(async (req, res, next) => {
		const { username, backdrop } = req.body
		await pool.query(
			`update users set
backdrop_url = $1
			where username = $2
	`,
			[backdrop, username]
		)
		res.status(200).json({ success: true })
	})
)

router.post(
	'/update/country',
	asyncHandler(async (req, res, next) => {
		console.log("calling")
		const { username, code } = req.body
		await pool.query(
			`update users set
country = $1
			where username = $2
	`,
			[code, username]
		)
		res.status(200).json({ success: true })
	})
)

router.put(
	'/update/token_id/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { username } = req.query
		await pool.query(
			`update users set
token_id = $1
		where id = $2; `,
			['null', username]
		)

		res.status(200).json({ success: true })
	})
)

router.put(
	'/add/genres',
	asyncHandler(async (req, res, next) => {
		const { topics, username } = req.body

		const { rows } = await pool.query(
			`update users set genres = array_cat(genres, $1) where username = $2; `,
			[topics, username]
		)

		res.status(200).json({ success: true, results: rows })
	})
)

router.get(
	'/genres/get/:username',
	asyncHandler(async (req, res, next) => {
		const { username } = req.params

		const { rows } = await pool.query(
			`SELECT array(select distinct unnest(genres)) AS genres
		from users where username = $1; `,
			[username]
		)

		res.status(200).json({ success: true, results: rows[0].genres })
	})
)
router.put(
	'/add/languages',
	asyncHandler(async (req, res, next) => {
		const { topics, username } = req.body
		await pool.query(`update users set languages = '{}' where username = $1`,
			[username])
		const { rows } = await pool.query(
			`update users set languages = array_cat(languages, $1) where username = $2; `,
			[topics, username]
		)

		res.status(200).json({ success: true, results: rows })
	})
)
router.get(
	'/get/languages',
	asyncHandler(async (req, res, next) => {
		const { username } = req.query
		const { rows } = await pool.query(`select languages from users where username = $1`,
			[username])

		res.status(200).json({ success: true, results: rows[0].languages })
	})
)

router.get(
	'/languages/get/:username',
	asyncHandler(async (req, res, next) => {
		const { username } = req.params

		const { rows } = await pool.query(
			`SELECT languages
		from users where username = $1; `,
			[username]
		)

		res.status(200).json({ success: true, results: rows[0].languages })
	})
)

router.get(
	'/genres/get/movies/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params

		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select poster, title, id, rating, release, 'movie' as type,
	(select rating from apprating where id = movies.id and type = 'movie') as rating_by_app	
			from movies
			 where '${id}' = ANY(genres) order by popularity desc offset $1 limit 20; `,
			[offset]
		)

		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)

router.get(
	'/genres/get/movies/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select poster, title, id, rating, release, 'movie' as type,
	(select rating from apprating where id = movies.id and type = 'movie') as rating_by_app	
			from movies
			 where '${id}' = ANY(genres) order by popularity desc offset $1 limit 20; `,
			[offset]
		)

		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)




export default router
