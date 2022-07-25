import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.post(
  '/add',
  asyncHandler(async (req, res, next) => {
    const { username, media_id, media_type, media_title, media_poster, media_rating } =
      req.body
    await pool.query(
      `insert into watched (	
                        username,
                        media_id,
                        media_type,
                        media_title,
                        media_poster,
                        media_rating
                        ) values($1,$2,$3,$4,$5,$6);`,

      [username, media_id, media_type, media_title, media_poster, media_rating]
    )

    res.status(200).send({
      success: true,
    })
  })
)

router.post(
  '/update',
  asyncHandler(async (req, res, next) => {
    const { username, media_id, media_type, media_rating } =
      req.body
    await pool.query(
      `update watched set media_rating=$1 where username=$2 and media_id=$3 and media_type=$4;`,
      [media_rating, username, media_id, media_type]
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
      `delete from watched 	where 
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
			(exists  (select 1 from watched
				where watched.username='${username}'
		    and watched.media_id = watched.media_id and watched.media_type=watched.media_type)
			     ) as iswatched
			from watched where username=$1 order by created desc offset $2 limit 20; `,
      [id, offset]
    )

    res.status(200).send({
      success: true,
      results: rows,
    })
  })
)

export default router
