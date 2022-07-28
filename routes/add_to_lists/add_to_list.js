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
  const { id, description, title } = req.body
  await pool.query(`UPDATE reviews SET body = $1,title=$3 WHERE list_id = $2`, [description, id, title])
  res.status(200).json({ message: 'List updated' })
}))

router.post('/submit', asyncHandler(async (req, res, next) => {
  const {
    list_id,
    username,
    title,
    description,
    images,
  } = req.body

  await pool.query(`insert into reviews(creator_username,title,list_id,list_images,body)
values ($1,$2,$3,$4,$5)`, [
    username,
    title,
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
  
    (case when list_items.media_type ='movie' then (select release from movies where id=list_items.media_id)
      when list_items.media_type='tv' then (select release from tvshows where id=list_items.media_id)
      else 'N/A' end) as media_release,
    (case when list_items.media_type ='movie' then (select rating from movies where id=list_items.media_id)
      when list_items.media_type='tv' then (select rating from tvshows where id=list_items.media_id)
      else 0.0 end) as media_rating,
			(exists  (select 1 from watchlist
			where watchlist.username='${username}'
		  and watchlist.media_id = list_items.media_id 
      and watchlist.media_type=list_items.media_type)) as iswatchlisted,
      (exists  (select 1 from watched
			where watched.username='${username}'
		  and watched.media_id = list_items.media_id 
      and watched.media_type=list_items.media_type)) as iswatched,
      (exists  (select 1 from favorites
			where favorites.username='${username}'
		  and favorites.media_id = list_items.media_id
      and favorites.media_type=list_items.media_type)) as isfavorited,
      (exists  (select 1 from reviews where reviews.creator_username='${username}'
      and reviews.movie->>'id' = list_items.media_id and reviews.movie->>'type'=list_items.media_type)) as isreviewd
      ,(select rating from apprating where id = list_items.media_id and type=list_items.media_type) as rating_by_app 
   from list_items where review_id = $1
  order by created_at;`, [id])

  res.status(200).json({
    success: true, results: rows,
  })


}))

router.put(
  '/add',
  asyncHandler(async (req, res, next) => {
    const { item_id, list_id, movie_id, movie_type, movie_title, movie_poster } =
      req.body

    console.log(req.body.media_id)
    await pool.query(`insert into list_items (
      id,
      review_id,
      media_id,
      media_title,
      media_poster,
      media_type)
      values ($1,$2,$3,$4,$5,$6);`,
      [
        item_id,
        list_id,
        movie_id,
        movie_title,
        movie_poster,
        movie_type,
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
        `select id,title,rating,poster,release,'movie' as type
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
       and id not in (select media_id from list_items where review_id=$2 and media_type='movie' ) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else if (lang === undefined && year !== undefined) {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release,'movie' as type
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      and release like '${year}%'
       and id not in (select media_id from list_items where review_id=$2 and media_type='movie' ) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })

    } else if (lang !== undefined && year === undefined) {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release,'movie' as type
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
    			and language='${lang}'
       and id not in (select media_id from list_items where review_id=$2 and media_type='movie' ) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release,'movie' as type
			from movies where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      and release like '${year}%' and language='${lang}'
       and id not in (select media_id from list_items where review_id=$2 and media_type='movie' ) order by popularity desc offset $1 limit 20;`,
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
        `select id,title,rating,poster,release,'tv' as type
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      
      and id not in (select media_id from list_items where review_id=$2 and media_type='tv')
       order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else if (lang === undefined && year !== undefined) {
      const { rows } = await pool.query(
        `select id,title,rating,poster,release,'tv' as type
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      	and release like '${year}%'
      and id not in (select media_id from list_items where review_id=$2 and media_type='tv')
       order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })

    } else if (lang !== undefined && year === undefined) {
      const { rows } = await pool.query(
        `select id,title,rating,poster,release,'tv' as type
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
       and language='${lang}'
      and id not in (select media_id from list_items where review_id=$2 and media_type='tv')
       order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })

    } else {
      const { rows } = await pool.query(
        `select id,title,rating,poster,release,'tv' as type
			from tvshows where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
      and release like '${year}%' and language='${lang}'
      and id not in (select media_id from list_items where review_id=$2 and media_type='tv')
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
      and id not in (select media_id from list_items where review_id=$2 and media_type=anime.type) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    } else {

      const { rows } = await pool.query(
        `select id,title,rating,poster,release,type
			from anime where (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%' )
      and id not in (select media_id from list_items where review_id=$2 and media_type=anime.type) order by popularity desc offset $1 limit 20;`,
        [offset, list_id]
      )
      res.status(200).send({ success: true, results: rows })
    }
  })
)





export default router
