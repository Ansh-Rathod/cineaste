import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.post(
	'/add',
	asyncHandler(async (req, res, next) => {
		const { username, media_id, media_type, media_title, media_poster } =
			req.body
		await pool.query(
			`insert into favorites (	
                        username,
                        media_id,
                        media_type,
                        media_title,
                        media_poster) values($1,$2,$3,$4,$5);`,

			[username, media_id, media_type, media_title, media_poster]
		)
		res.status(200).send({
			success: true,
		})
	})
)
router.delete(
	'/remove',
	asyncHandler(async (req, res, next) => {
		const { username, media_id } = req.query
		await pool.query(
			`delete from favorites 	where 
                        username=$1 and
                        media_id=$2;`,

			[username, media_id]
		)
		res.status(200).send({
			success: true,
		})
	})
)
router.get(
	'/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { username, page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select *,
			(exists  (select 1 from favorites
				where favorites.username='${username}'
		    and favorites.media_id = favorites.media_id and favorites.media_type=favorites.media_type)
			     ) as isFavorited
			from favorites where username=$1 order by created desc offset $2 limit 20; `,
			[id, offset]
		)

		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)

export default router
