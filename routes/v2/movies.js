import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()


router.get(
  '/upcoming',
  asyncHandler(async (req, res, next) => {
    const { language, username } = req.query
    const { rows } = await pool.query(
      `select id,
        title,release,poster,rating,'movie' as type,
        (exists  (select 1 from watchlist as yo
        where yo.username='${username}'
        and yo.media_id = movies.id 
        and yo.media_type='movie')) as iswatchlisted,
        (exists  (select 1 from watched
        where watched.username='${username}'
        and watched.media_id = movies.id 
        and watched.media_type='movie')) as iswatched,
        (exists  (select 1 from favorites
        where favorites.username='${username}'
        and favorites.media_id = movies.id 
        and favorites.media_type='movie')) as isfavorited,
        (exists  (select 1 from reviews where reviews.creator_username='${username}'
        and reviews.movie->>'id' = movies.id and reviews.movie->>'type'='movie')) as isreviewd,
        (select rating from apprating where id = movies.id and type='movie') as rating_by_app
        from movies
        where  (language = $1 and poster is not null and release is not null) 
        and cast((movies.release) as timestamp) > now() - interval '7 days' order by release limit 20;`,
      [language]
    )
    res.status(200).json({ success: true, results: rows })
  })
)

router.get(
  '/user/watchlist/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { username, page } = req.query
    const offset = (page ?? 0) * 20
    const { rows } = await pool.query(
      `select *,
      (case when watchlist.media_type ='movie' then (select release from movies where id=watchlist.media_id)
      when watchlist.media_type='tv' then (select release from tvshows where id=watchlist.media_id) 
      else 'N/A' end) as media_release,
      (case when watchlist.media_type ='movie' then (select rating from movies where id=watchlist.media_id)
      when watchlist.media_type='tv' then (select rating from tvshows where id=watchlist.media_id) 
      else 0.0 end) as media_rating,
			(exists  (select 1 from watchlist as yo
			where yo.username='${username}'
		  and yo.media_id = watchlist.media_id 
      and yo.media_type=watchlist.media_type)) as iswatchlisted,
      (exists  (select 1 from watched
			where watched.username='${username}'
		  and watched.media_id = watchlist.media_id 
      and watched.media_type=watchlist.media_type)) as iswatched,
      (exists  (select 1 from favorites
			where favorites.username='${username}'
		  and favorites.media_id = watchlist.media_id 
      and favorites.media_type=watchlist.media_type)) as isfavorited,
      (exists  (select 1 from reviews where reviews.creator_username='${username}'
       and reviews.movie->>'id' = watchlist.media_id and reviews.movie->>'type'=watchlist.media_type)) as isreviewd
      ,(select rating from apprating where id = watchlist.media_id and type=watchlist.media_type) as rating_by_app

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
  '/user/watched/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { username, page } = req.query
    const offset = (page ?? 0) * 20
    const { rows } = await pool.query(
      `select media_id,media_type,media_title,media_poster,media_rating as user_rating,
      username,watched.created,
      (select avatar_url from users where username=watched.username) as avatar_url,
      (case when watched.media_type ='movie' then (select release from movies where id=watched.media_id)
      when watched.media_type='tv' then (select release from tvshows where id=watched.media_id) 
      else 'N/A' end) as media_release,
      (case when watched.media_type ='movie' then (select rating from movies where id=watched.media_id)
      when watched.media_type='tv' then (select rating from tvshows where id=watched.media_id) 
      else 0.0 end) as media_rating,
			(exists  (select 1 from watchlist
			where watchlist.username='${username}'
		  and watchlist.media_id = watched.media_id 
      and watchlist.media_type=watched.media_type)) as iswatchlisted,
      (exists  (select 1 from watched as yo
			where yo.username='${username}'
		  and yo.media_id = watched.media_id 
      and yo.media_type=watched.media_type)) as iswatched,
      (exists  (select 1 from favorites
			where favorites.username='${username}'
		  and favorites.media_id = watched.media_id 
      and favorites.media_type=watched.media_type)) as isfavorited,
      (exists  (select 1 from reviews where reviews.creator_username='${username}'
      and reviews.movie->>'id' = watched.media_id and reviews.movie->>'type'=watched.media_type)) as isreviewd,
       (select id from reviews where reviews.creator_username=watched.username
      and reviews.movie->>'id' = watched.media_id and reviews.movie->>'type'=watched.media_type) as iswriten
      ,(select rating from apprating where id = watched.media_id and type=watched.media_type) as rating_by_app 
      from watched where username=$1 order by created desc offset $2 limit 20; `,
      [id, offset]
    )

    res.status(200).send({
      success: true,
      results: formatResult(rows),
    })
  })
)

router.get(
  '/user/favorites/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { username, page } = req.query
    const offset = (page ?? 0) * 20
    const { rows } = await pool.query(
      `select *,
      (case when favorites.media_type ='movie' then (select release from movies where id=favorites.media_id)
      when favorites.media_type='tv' then (select release from tvshows where id=favorites.media_id) 
      else 'N/A' end) as media_release,
      (case when favorites.media_type ='movie' then (select rating from movies where id=favorites.media_id)
      when favorites.media_type='tv' then (select rating from tvshows where id=favorites.media_id) 
      else 0.0 end) as media_rating,
			(exists  (select 1 from watchlist
			where watchlist.username='${username}'
		  and watchlist.media_id = favorites.media_id 
      and watchlist.media_type=favorites.media_type)) as iswatchlisted,
      (exists  (select 1 from watched
			where watched.username='${username}'
		  and watched.media_id = favorites.media_id 
      and watched.media_type=favorites.media_type)) as iswatched,
      (exists  (select 1 from favorites as yo
			where yo.username='${username}'
		  and yo.media_id = favorites.media_id 
      and yo.media_type=favorites.media_type)) as isfavorited,
      (exists  (select 1 from reviews where reviews.creator_username='${username}'
      and reviews.movie->>'id' = favorites.media_id and reviews.movie->>'type'=favorites.media_type)) as isreviewd
      ,(select rating from apprating where id = favorites.media_id and type=favorites.media_type) as rating_by_app 
      from favorites where username=$1 order by created desc offset $2 limit 20; `,
      [id, offset]
    )
    // rating_by_app
    res.status(200).send({
      success: true,
      results: rows,
    })
  })
)

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

function formatResult(rows) {
  return rows.map((row) => {
    return {
      media_id: row.media_id,
      media_type: row.media_type,
      media_title: row.media_title,
      media_poster: row.media_poster,
      user_rating: row.user_rating,
      username: row.username,
      avatar_url: row.avatar_url,
      media_release: row.media_release,
      media_rating: row.media_rating,
      iswatchlisted: row.iswatchlisted,
      iswatched: row.iswatched,
      isfavorited: row.isfavorited,
      isreviewd: row.isreviewd,
      iswriten: row.iswriten,
      rating_by_app: row.rating_by_app,
      created: formateTime(row.created),
    }
  })
}
export default router
