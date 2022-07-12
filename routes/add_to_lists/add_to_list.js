import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()



router.post('/init', asyncHandler(async (req, res, next) => {
  const { id, title } = req.body
  await pool.query(`INSERT INTO list_drafts (id,title) VALUES ($1,$2)`, [id, title])
  res.status(200).json({ message: 'List created' })
}))

router.post('/name', asyncHandler(async (req, res, next) => {
  const { id, title } = req.body
  await pool.query(`UPDATE list_drafts SET title = $1 WHERE id = $2`, [title, id])
  res.status(200).json({ message: 'List name updated' })
}))

router.post('/description', asyncHandler(async (req, res, next) => {
  const { id, description } = req.body
  await pool.query(`UPDATE list_drafts SET description = $1 WHERE id = $2`, [description, id])
  res.status(200).json({ message: 'List description updated' })
}))

router.post('/submit', asyncHandler(async (req, res, next) => {
  const {
    list_id,
    username,
    title,
    description,
    items,
    images,
  } = req.body

  await pool.query(`insert into reviews(creator_username,title,num_of_list_items,list_id,list_images,body)
values ($1,$2,$3,$4,$5,$6)`, [
    username,
    title,
    items,
    list_id,
    images,
    description,
  ])
  await pool.query(`delete from list_drafts where id = $1`, [list_id])

  res.status(200).json({ message: 'List submitted' })

}))

router.put(
  '/add',
  asyncHandler(async (req, res, next) => {
    const { list_id, movie_id, movie_type, movie_title, movie_poster, movie_release, index, } =
      req.body

    console.log(req.body.movie_id)
    await pool.query(`insert into list_items (
      review_id,
      movie_id,
      movie_title,
      movie_poster,
      movie_release,
      movie_type,    
      index)
      values ($1,$2,$3,$4,$5,$6,$7);`,

      [list_id,
        movie_id,
        movie_title,
        movie_poster,
        movie_release,
        movie_type,
        index]
    );

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
      `delete from list_items where id=$1;`,

      [id]
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
			(exists  (select 1 from watchlist
				where watchlist.username='${username}'
		    and watchlist.media_id = watchlist.media_id and watchlist.media_type=watchlist.media_type)
			     ) as iswatchlisted
			from watchlist where username=$1 order by created desc offset $2 limit 20; `,
      [id, offset]
    )

    res.status(200).send({
      success: true,
      results: rows,
    })
  })
)

router.get(
  '/search/movies',
  asyncHandler(async (req, res, next) => {
    const { query, username } = req.query
    const { page } = req.query
    const offset = (page ?? 0) * 20

    const { rows } = await pool.query(
      `select id,title,rating,poster,release,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = movies.id and reviews.movie->>'type'='movie')
			     ) as isReviewd
			from movies where lower(title) like '%${query}%'
       and id not in (select media_id from watchlist where username='${username}' and media_type='movie' ) order by popularity desc offset $1 limit 20;`,
      [offset]
    )
    res.status(200).send({ success: true, results: rows })
  })
)
router.get(
  '/search/tv',
  asyncHandler(async (req, res, next) => {
    const { query, username } = req.query
    const { page } = req.query
    const offset = (page ?? 0) * 20

    const { rows } = await pool.query(
      `select id,title,rating,poster,release
			,    (exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		    and reviews.movie->>'id' = tvshows.id and reviews.movie->>'type'='tv')
			     ) as isReviewd
			from tvshows where lower(title) like '%${query}%' 
      and id not in (select media_id from watchlist where username='${username}' and media_type='tv') order by popularity desc offset $1 limit 20;`,
      [offset]
    )
    res.status(200).send({ success: true, results: rows })
  })
)

export default router
