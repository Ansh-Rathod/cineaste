import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()


function formateTime(time) {
  function padTo2Digits(num) {
    return num.toString().padStart(2, '0')
  }

  function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(':')
    )
  }
  const now = new Date(time)
  const date = formatDate(now)
  return date
}

router.post('/init', asyncHandler(async (req, res, next) => {
  const { id, title, username } = req.body
  await pool.query(`INSERT INTO list_drafts (id,title,username) VALUES ($1,$2,$3)`, [id, title, username])
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

router.post('/update/published', asyncHandler(async (req, res, next) => {
  const { id, description, title, items } = req.body
  await pool.query(`UPDATE list_drafts SET description = $1,title=$3,num_of_list_items=$4 WHERE id = $2`, [description, id, title, items])
  res.status(200).json({ message: 'List updated' })
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

router.get('/get_drafted', asyncHandler(async (req, res, next) => {

  const { username } = req.query

  const { rows } = await pool.query(`select id,username,title,description,images,created_at,
(select count(*) from list_items where review_id= list_drafts.id),'unpublished' as type  from list_drafts where username =$1
UNION ALL
(select list_id as id,
creator_username as username,
title as title,
body as description,
list_images as images,
created_at,
(select count(*) from list_items where review_id= reviews.list_id) as count,
'published' as type
from reviews where list_id is not null and creator_username=$1 order by created_at desc);`, [username])

  res.status(200).json({
    success: true, results: rows.map(row => {

      return {
        id: row.id,
        description: row.description,
        title: row.title,
        count: row.count,
        images: row.images,
        type: row.type,
        created_at: formateTime(row.created_at),
      }
    })
  })

}))


router.get('/items/:id', asyncHandler(async (req, res, next) => {


  const { id } = req.params
  const { username } = req.query
  const { rows } = await pool.query(`select *,
  (exists  (select 1 from watchlist
				where watchlist.username='${username}'
		    and watchlist.media_id = list_items.movie_id and watchlist.media_type=list_items.movie_type)
			     ) as iswatchlisted
   from list_items where review_id = $1
  order by created_at;`, [id])

  res.status(200).json({
    success: true, results: rows.map(row => {

      return {
        id: row.id,
        media_id: row.movie_id,
        media_title: row.movie_title,
        media_poster: row.movie_poster,
        media_release: row.movie_release,
        media_type: row.movie_type,
        media_rating: row.movie_rating,
        iswatchlisted: row.iswatchlisted

      }
    })
  })


}))

router.put(
  '/add',
  asyncHandler(async (req, res, next) => {
    const { item_id, list_id, movie_id, movie_type, movie_rating, movie_title, movie_poster, movie_release, } =
      req.body

    console.log(req.body.movie_id)
    await pool.query(`insert into list_items (
      id,
      review_id,
      movie_id,
      movie_title,
      movie_poster,
      movie_release,
      movie_type,    
      movie_rating)
      values ($1,$2,$3,$4,$5,$6,$7,$8);`,

      [
        item_id,
        list_id,
        movie_id,
        movie_title,
        movie_poster,
        movie_release,
        movie_type,
        movie_rating
      ]
    );

    res.status(200).send({
      success: true,
    })
  })
)

router.put('/update/draft', asyncHandler(async (req, res, next) => {


  await pool.query(`UPDATE list_drafts SET images = array_append(images,$2) WHERE id = $1`,
    [req.body.id, req.body.image])

  res.status(200).send({
    success: true,
  })
}))

router.put('/update/draft/images', asyncHandler(async (req, res, next) => {


  await pool.query(`UPDATE list_drafts SET images = $2 WHERE id = $1`,
    [req.body.id, req.body.images])

  res.status(200).send({
    success: true,
  })
}))

router.put('/update/published/images', asyncHandler(async (req, res, next) => {


  await pool.query(`UPDATE reviews SET list_images = $2 WHERE list_id = $1`,
    [req.body.id, req.body.images])

  res.status(200).send({
    success: true,
  })
}))


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

router.delete(
  '/delete/list/published',
  asyncHandler(async (req, res, next) => {
    const { id } = req.query
    await pool.query(
      `delete from reviews where list_id=$1;`,

      [id]
    )
    await pool.query(
      `delete from list_items where review_id=$1;`,
      [id]
    )
    res.status(200).send({
      success: true,
    })
  })
)

router.delete(
  '/delete/list/drafted',
  asyncHandler(async (req, res, next) => {
    const { id } = req.query
    await pool.query(
      `delete from list_drafts where id=$1;`,

      [id]
    )
    await pool.query(
      `delete from list_items where review_id=$1;`,
      [id]
    )
    res.status(200).send({
      success: true,
    })
  })
)



router.get(
  '/search/movies',
  asyncHandler(async (req, res, next) => {
    const { query, list_id, lang, year } = req.query
    const { page } = req.query
    const offset = (page ?? 0) * 20
    console.log('calling list')
    console.log(list_id)
    if (lang === undefined && year === undefined) {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
       and id not in (select movie_id from list_items where review_id=$2 and movie_type='movie' ) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else if (lang === undefined && year !== undefined) {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      and release like '${year}%'
       and id not in (select movie_id from list_items where review_id=$2 and movie_type='movie' ) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })

    } else if (lang !== undefined && year === undefined) {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
    			and language='${lang}'
       and id not in (select movie_id from list_items where review_id=$2 and movie_type='movie' ) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      and release like '${year}%' and language='${lang}'
       and id not in (select movie_id from list_items where review_id=$2 and movie_type='movie' ) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    }
  })
)
router.get(
  '/search/tv',
  asyncHandler(async (req, res, next) => {
    const { query, list_id, lang, year } = req.query
    const { page } = req.query
    const offset = (page ?? 0) * 20
    if (lang === undefined && year === undefined) {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      
      and id not in (select movie_id from list_items where review_id=$2 and movie_type='tv')
       order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else if (lang === undefined && year !== undefined) {
      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      	and release like '${year}%'
      and id not in (select movie_id from list_items where review_id=$2 and movie_type='tv')
       order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })

    } else if (lang !== undefined && year === undefined) {
      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
       and language='${lang}'
      and id not in (select movie_id from list_items where review_id=$2 and movie_type='tv')
       order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })

    } else {
      const { rows } = await pool.query(
        `select id,title,rating,poster,release
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      and release like '${year}%' and language='${lang}'
      and id not in (select movie_id from list_items where review_id=$2 and movie_type='tv')
       order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })

    }
  })
)


router.get(
  '/search/anime',
  asyncHandler(async (req, res, next) => {
    const { query, list_id, year } = req.query
    const { page } = req.query
    const offset = (page ?? 0) * 20
    if (year !== undefined) {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release,type
			from anime where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%' )
      	and release like '${year}%'
      and id not in (select movie_id from list_items where review_id=$2 and movie_type=anime.type) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release,type
			from anime where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%' )
      and id not in (select movie_id from list_items where review_id=$2 and movie_type=anime.type) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    }
  })
)


export default router
