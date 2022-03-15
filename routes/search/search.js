import express from 'express'
import moment from 'moment-timezone'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'

const router = express.Router()
moment().tz('America/Los_Angeles').format()

router.get(
	'/trending',
	asyncHandler(async (req, res, next) => {
		var a = moment.tz(new Date(), 'America/Los_Angeles').format('YYYY-MM-DD')

		const { rows } = await pool.query(
			`select id,title,release,rating,poster,type from trending where date='${a}' order by popularity desc limit 20;`
		)

		res.status(200).json({ success: true, results: rows })
	})
)
router.get(
	'/movies',
	asyncHandler(async (req, res, next) => {
		const { query, year } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		if (year === undefined) {
			const { rows } = await pool.query(
				`select id,title,rating,poster,release from movies where lower(title) like '%${query}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else {
			const { rows } = await pool.query(
				`select id,title,rating,poster,release from movies where lower(title) like '%${query}%' and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		}
	})
)
router.get(
	'/tv',
	asyncHandler(async (req, res, next) => {
		const { query, year } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		if (year === undefined) {
			const { rows } = await pool.query(
				`select id,title,rating,poster,release from tvshows where lower(title) like '%${query}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else {
			const { rows } = await pool.query(
				`select id,title,rating,poster,release from tvshows where lower(title) like '%${query}%' and release like '${year}%' order by popularity desc offset $1 limit 20 ;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		}
	})
)
router.get(
	'/user',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select id,username,avatar_url,display_name from users where lower(display_name) like '%${query}%' or lower(username) like '%${query}%' order by created desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).send({ success: true, results: rows })
	})
)

router.get(
	'/hashtags',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query
		const { rows } = await pool.query(
			`select name from hashtags where lower(name) like '${query}%' limit 20;`
		)
		res.status(200).send({ success: true, results: rows })
	})
)
router.get(
	'/username',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query
		const { rows } = await pool.query(
			`select username,display_name from users where lower(username) like '${query}%' limit 20;`
		)
		res.status(200).send({ success: true, results: rows })
	})
)

export default router
