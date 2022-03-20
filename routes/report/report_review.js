import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.post(
	'/new',
	asyncHandler(async (req, res, next) => {
		const { report_by, review_id } = req.query
		await pool.query(
			`insert into report_reviews (review_id,reportd_by) values($1,$2);`,

			[review_id, report_by]
		)
		res.status(200).send({
			success: true,
		})
	})
)

export default router
