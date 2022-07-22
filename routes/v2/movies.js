import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()


router.get(
  '/upcoming',
  asyncHandler(async (req, res, next) => {
    const { language } = req.query
    const { rows } = await pool.query(
      `select id,
        title,release,poster,rating,'movie' as type from movies
        where language = $1 and adult = false and 
        poster is not null and (release)::timestamp > current_date - interval '7 days' order by release limit 20;`,
      [language]
    )
    res.status(200).json({ success: true, results: rows })
  })
)


export default router
