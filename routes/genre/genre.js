import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.get(
	'/movies/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { language, page, release } = req.query
		const offset = (page ?? 0) * 20
		const year = release
		if (language === undefined) {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release from movies
                         where '${id}'= ANY(genres) and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)

			res.status(200).send({
				success: true,
				results: rows,
			})
		} else {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release from movies
                          where '${id}'= ANY(genres) and language='${language}' and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)

			res.status(200).send({
				success: true,
				results: rows,
			})
		}
	})
)

router.get(
	'/tv/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { language, page, release } = req.query
		const offset = (page ?? 0) * 20
		const year = release
		if (language === undefined) {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release from tvshows
                         where '${id}'= ANY(genres) and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)

			res.status(200).send({
				success: true,
				results: rows,
			})
		} else {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release from tvshows
                          where '${id}'= ANY(genres) and language='${language}' and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)

			res.status(200).send({
				success: true,
				results: rows,
			})
		}
	})
)

export default router
