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
			await createNewUser(req.body)

			res.status(201).json({
				success: true,
				status: 201,
				message: 'User created successfully',
				results: await (await getUser(req.body.id, false)).rows[0],
			})
		} else {
			await pool.query(`update users set token_id = $1 where id = $2;`, [
				req.body.token_id,
				req.body.id,
			])
			res.status(200).json({
				success: true,
				status: 200,
				message: 'Successfully login.',
				results: rows[0],
			})
		}
	})
)
function sendNotification(id, heading, body, icon) {
	axios({
		method: 'POST',
		url: `https://onesignal.com/api/v1/notifications`,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		data: {
			app_id: 'f6c7d71f-01af-4791-a073-bedca73e3eb9',
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

router.put(
	'/username/check',
	asyncHandler(async (req, res, next) => {
		const { username } = req.query
		const { rows } = await pool.query(
			'select exists(select 1 from users where username=$1)',

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
			(select display_name from users where username=$2) as name,
			(select avatar_url from users where username=$2) as avatar_url
			from users where username=$1`,
			[user_id, follower_id]
		)
		sendNotification(
			data.rows[0].token_id,
			'@' + follower_id,
			`${data.rows[0].name} started following you`,
			data.rows[0].avatar_url
		)
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
		select users.id,users.username,users.display_name,users.avatar_url,
		(exists  (select 1 from followers
		where followers.user_id=users.username
		and followers.follower_id = '${username}')
		) as isfollow
		from followers left join users 
		on followers.user_id = users.username where follower_id = $1 
		order by followers.created desc offset $2 limit 20`,
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
			select users.id,users.username,users.display_name,users.avatar_url,
						(exists  (select 1 from followers
							where followers.user_id=users.username
					    and followers.follower_id = '${username}')
						     ) as isfollow
			from followers left join users 
			on followers.follower_id = users.username where user_id = $1 
			order by followers.created desc offset $2 limit 20;`,
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
			`select username,display_name,avatar_url, (exists  (select 1 from followers
			where followers.user_id=users.username
			and followers.follower_id = '${username}')) as isfollow
			from users limit 20;`
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
			display_name=$1,
			avatar_url=$2,
			backdrop_url=$3,
			bio=$4 
			where username=$5
			`,
			[name, profile, backdrop, bio, username]
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
		token_id=$1
		where id=$2;`,
			[id, username]
		)

		res.status(200).json({ success: true })
	})
)

export default router
