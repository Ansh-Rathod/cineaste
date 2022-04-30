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
function formatResult(rows) {
	return rows.map((row) => {
		return {
			id: row.id,
			username: row.username,
			display_name: row.display_name,
			avatar_url: row.avatar_url,
			backdrop_url: row.backdrop_url,
			email: row.email,
			bio: row.bio,
			followers: row.followers,
			following: row.following,
			token_id: row.token_id,
			device_id: row.device_id,
			created_at: formateTime(row.created),
		}
	})
}

router.get(
	'/users',
	asyncHandler(async (req, res, next) => {
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select * from users order by created desc offset $1 limit 20;`,
			[offset]
		)

		res.send({ rows: formatResult(rows) })
	})
)

router.get(
	'/users/search',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query

		const { rows } = await pool.query(
			`select * from users where LOWER(username) like '%${query}%' limit 20;`
		)

		res.send({ rows: formatResult(rows) })
	})
)

export default router
