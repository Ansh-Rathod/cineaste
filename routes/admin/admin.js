import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'

const router = express.Router()

router.get(
	'/users',
	asyncHandler(async (req, res, next) => {
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select * from users order by desc offset $1 limit 20;`,
			[offset]
		)

		res.send(rows)
	})
)

export default router
