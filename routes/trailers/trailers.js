import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.post(
  '/trailers/add',
  asyncHandler(async (req, res, next) => {
    const { url, title, code, media_id, language, media_type, media_title, media_poster } =
      req.body
    await pool.query(
      `insert into trailers (	
                        url,
                        title,
                        code,
                        language,
                        media_id,
                        media_type,
                        media_title,
                        media_poster) values($1,$2,$3,$4,$5,$6,$7,$8);`,

      [url, title, code, language, media_id, media_type, media_title, media_poster]
    )

    res.status(200).send({
      success: true,
    })
  })
)




router.post(
  '/platform/add',
  asyncHandler(async (req, res, next) => {
    const { id, platform, media_id, media_type } =
      req.body
    await pool.query(
      `insert into platforms_movies (	
                        id,
                        platform,
                        media_id,
                        media_type
                      ) values($1,$2,$3,$4);`,
      [id, platform, media_id, media_type]
    )

    res.status(200).send({
      success: true,
    })
  })
)


router.get(
  '/trailers',
  asyncHandler(async (req, res, next) => {
    const { rows } = await pool.query(
      `select * from trailers order by created desc limit 30;`,
    )

    res.status(200).send({
      success: true,
      results: rows,
    })
  })
)

router.get(
  '/platform/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { rows } = await pool.query(
      `(select platforms_movies.created,platforms_movies.id as model_id,movies.id,movies.title,movies.rating,movies.release,movies.poster,media_type as type from platforms_movies
        left join movies on platforms_movies.media_id=movies.id where media_type='movie' and platforms_movies.platform=$1 order by platforms_movies.created desc limit 10)
        union all
        (select platforms_movies.created,platforms_movies.id as model_id,tvshows.id,tvshows.title,tvshows.rating,tvshows.release,tvshows.poster,media_type as type from platforms_movies
        left join tvshows on platforms_movies.media_id=tvshows.id where media_type='tv' and platforms_movies.platform=$1 order by platforms_movies.created desc limit 10);`,
      [id]
    )

    function compare(a, b) {
      if (a.created < b.created) {
        return 1
      }
      if (a.created > b.created) {
        return -1
      }
      return 0
    }
    res.status(200).send({
      success: true,
      results: rows.sort(compare),
    })
  })
)




router.delete(
  '/trailers/remove',
  asyncHandler(async (req, res, next) => {
    const { id } = req.query
    await pool.query(
      `delete from trailers 	where 
                        id=$1;`,

      [id]
    )
    res.status(200).send({
      success: true,
    })
  })
)


router.delete(
  '/platform/remove',
  asyncHandler(async (req, res, next) => {
    const { id } = req.query
    await pool.query(
      `delete from platforms_movies 	where 
                        id=$1;`,

      [id]
    )
    res.status(200).send({
      success: true,
    })
  })
)



export default router
