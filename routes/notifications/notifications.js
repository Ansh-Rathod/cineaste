import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'

const router = express.Router()

function formateTime(time) {
	function padTo2Digits(num) {
		return num.toString().padStart(2, '0')
	}

	function formatDate(date) {
		return (
			[
				date.getFullYear(),
				padTo2Digits(date.getMonth() + 1),
				padTo2Digits(date.getDate()),
			].join('-') +
			' ' +
			[
				padTo2Digits(date.getHours()),
				padTo2Digits(date.getMinutes()),
				padTo2Digits(date.getSeconds()),
			].join(':')
		)
	}
	const now = new Date(time)
	const date = formatDate(now)
	return date
}
router.get(
	'/:username',
	asyncHandler(async (req, res, next) => {
		const { username } = req.params

		const { page } = req.query
		const offset = (page ?? 0) * 20

		const { rows } = await pool.query(
			`select notifications.id,
			owner_username,
			owner_review_body,
			owner_review_id,
			owner_list_id,
			(select title from reviews where id = owner_review_id) as owner_review_title,
			reactor_username,
			rector_body,
			rector_reply_id,
			message_type,
			active,
			created_at,
			  display_name,
			  avatar_url
		   ,users.critic
			 from notifications left join users on
                  notifications.reactor_username = users.username where owner_username = '${username}' order by created_at desc offset $1 limit 20;`,
			[offset]
		)

		res.status(200).send({
			success: true,
			results: rows.map((row) => {
				return {
					id: row.id,
					owner_username: row.owner_username,
					owner_review_body: row.owner_review_body,
					owner_review_id: row.owner_review_id,
					owner_list_id: row.owner_list_id,
					owner_list_title: row.owner_review_title,
					reactor_username: row.reactor_username,
					rector_reply_id: row.rector_reply_id,
					rector_body: row.rector_body,
					message_type: row.message_type,
					active: row.active,
					display_name: row.display_name,
					avatar_url: row.avatar_url,
					critic: row.critic,
					created_at: formateTime(row.created_at),
				}
			}),
		})
	})
)

router.get(
	'/:username/bell',
	asyncHandler(async (req, res, next) => {
		const { username } = req.params

		const { rows } = await pool.query(
			`select count(*) from notifications where owner_username='${username}' and active=true;`
		)
		res.status(200).send({ success: true, count: rows[0].count })
	})
)
router.get(
	'/:username/init',
	asyncHandler(async (req, res, next) => {
		const { username } = req.params

		await pool.query(
			`update notifications set active = false where owner_username='${username}';`
		)
		res.status(200).send({ success: true })
	})
)

export default router
