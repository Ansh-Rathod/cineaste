import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.post(
  '/add',
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


router.delete(
  '/remove',
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



export default router
