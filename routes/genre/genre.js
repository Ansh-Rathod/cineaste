import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.get(
	'/movies/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { language, page, release, username } = req.query
		const offset = (page ?? 0) * 20
		const year = release
		if (language === undefined) {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release,'movie' as type,
				(exists  (select 1 from watchlist
				where username='${username}'
				and media_id = movies.id 
				and media_type ='movie')) as iswatchlisted,
				(exists  (select 1 from watched
				where watched.username='${username}'
				and watched.media_id = movies.id 
				and watched.media_type ='movie')) as iswatched,
				(exists  (select 1 from favorites
				where favorites.username='${username}'
				and favorites.media_id = movies.id 
				and favorites.media_type ='movie')) as isfavorited,
				(exists  (select 1 from reviews where reviews.creator_username='${username}'
				and reviews.movie->>'id' = movies.id and reviews.movie->>'type' ='movie')) as isReviewd,
				(select rating from apprating where id = movies.id and type ='movie') as rating_by_app
				 from movies
                         where '${id}'= ANY(genres) and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)

			res.status(200).send({
				success: true,
				results: rows,
			})
		} else {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release,'movie' as type,
				(exists  (select 1 from watchlist
				where username='${username}'
				and media_id = movies.id 
				and media_type='movie')) as iswatchlisted,
				(exists  (select 1 from watched
				where watched.username='${username}'
				and watched.media_id = movies.id 
				and watched.media_type ='movie')) as iswatched,
				(exists  (select 1 from favorites
				where favorites.username='${username}'
				and favorites.media_id = movies.id 
				and favorites.media_type ='movie')) as isfavorited,
				(exists  (select 1 from reviews where reviews.creator_username='${username}'
				and reviews.movie->>'id' = movies.id and reviews.movie->>'type' ='movie')) as isReviewd,
				(select rating from apprating where id = movies.id and type ='movie') as rating_by_app
				 from movies
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
		const { language, page, release, username } = req.query
		const offset = (page ?? 0) * 20
		const year = release
		if (language === undefined) {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release,'tv' as type,
				(exists  (select 1 from watchlist
				where username='${username}'
				and media_id = tvshows.id 
				and media_type='tv')) as iswatchlisted,
				(exists  (select 1 from watched
				where watched.username='${username}'
				and watched.media_id = tvshows.id 
				and watched.media_type='tv')) as iswatched,
				(exists  (select 1 from favorites
				where favorites.username='${username}'
				and favorites.media_id = tvshows.id 
				and favorites.media_type='tv')) as isfavorited,
				(exists  (select 1 from reviews where reviews.creator_username='${username}'
				and reviews.movie->>'id' = tvshows.id and reviews.movie->>'type'='tv')) as isReviewd,
				(select rating from apprating where id = tvshows.id and type='tv') as rating_by_app
				 from tvshows where '${id}'= ANY(genres) and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)

			res.status(200).send({
				success: true,
				results: rows,
			})
		} else {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release,'tv' as type,
					(exists  (select 1 from watchlist
				where username='${username}'
				and media_id = tvshows.id 
				and media_type='tv')) as iswatchlisted,
				(exists  (select 1 from watched
				where watched.username='${username}'
				and watched.media_id = tvshows.id 
				and watched.media_type='tv')) as iswatched,
				(exists  (select 1 from favorites
				where favorites.username='${username}'
				and favorites.media_id = tvshows.id 
				and favorites.media_type='tv')) as isfavorited,
				(exists  (select 1 from reviews where reviews.creator_username='${username}'
				and reviews.movie->>'id' = tvshows.id and reviews.movie->>'type'='tv')) as isReviewd,
				(select rating from apprating where id = tvshows.id and type='tv') as rating_by_app
				 from tvshows
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
	'/anime/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { page, release, username } = req.query
		const offset = (page ?? 0) * 20
		const year = release

		if (year !== undefined) {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release, type,
				(exists  (select 1 from watchlist
				where username='${username}'
				and media_id = anime.id 
				and media_type=anime.type)) as iswatchlisted,
				(exists  (select 1 from watched
				where watched.username='${username}'
				and watched.media_id = anime.id 
				and watched.media_type=anime.type)) as iswatched,
				(exists  (select 1 from favorites
				where favorites.username='${username}'
				and favorites.media_id = anime.id 
				and favorites.media_type=anime.type)) as isfavorited,
				(exists  (select 1 from reviews where reviews.creator_username='${username}'
				and reviews.movie->>'id' = anime.id and reviews.movie->>'type'=anime.type)) as isReviewd,
				(select rating from apprating where id = anime.id and type=anime.type) as rating_by_app
				 from anime where '${id}'= ANY(genres) and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)

			res.status(200).send({
				success: true,
				results: rows,
			})
		} else {
			const { rows } = await pool.query(
				`select poster,title,id,rating,release, type,
				(exists  (select 1 from watchlist
				where username='${username}'
				and media_id = anime.id 
				and media_type=anime.type)) as iswatchlisted,
				(exists  (select 1 from watched
				where watched.username='${username}'
				and watched.media_id = anime.id 
				and watched.media_type=anime.type)) as iswatched,
				(exists  (select 1 from favorites
				where favorites.username='${username}'
				and favorites.media_id = anime.id 
				and favorites.media_type=anime.type)) as isfavorited,
				(exists  (select 1 from reviews where reviews.creator_username='${username}'
				and reviews.movie->>'id' = anime.id and reviews.movie->>'type'=anime.type)) as isReviewd,
				(select rating from apprating where id = anime.id and type=anime.type) as rating_by_app
				 from anime where '${id}'= ANY(genres) order by popularity desc offset $1 limit 20;`,
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
