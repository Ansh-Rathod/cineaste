import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.get(
	'/movie/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { rows } = await pool.query(
			`select title,poster,overview from movies where id=$1;`,

			[id]
		)
		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)

export default router
