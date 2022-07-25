import axios from 'axios'
import express from 'express'
import moment from 'moment-timezone'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'

const baseUrl = 'https://api.themoviedb.org/3/'
const api_key = '?api_key=b6e66a75ceca7996c5772ddd0656dd1b'

const router = express.Router()
moment().tz('America/Los_Angeles').format()

router.get(
	'/trending',
	asyncHandler(async (req, res, next) => {

		const { username } = req.query
		var a = moment.tz(new Date(), 'America/Los_Angeles').format('YYYY-MM-DD')

		const { rows } = await pool.query(
			`select id,title,release,rating,poster,type,
			(exists  (select 1 from watchlist
			where username='${username}'
			and media_id = trending.id 
			and media_type=trending.type)) as iswatchlisted,
			(exists  (select 1 from watched
			where watched.username='${username}'
			and watched.media_id = trending.id 
			and watched.media_type=trending.type)) as iswatched,
			(exists  (select 1 from favorites
			where favorites.username='${username}'
			and favorites.media_id = trending.id 
			and favorites.media_type=trending.type)) as isfavorited,
			(exists  (select 1 from reviews where reviews.creator_username='${username}'
			and reviews.movie->>'id' = trending.id and reviews.movie->>'type'=trending.type)) as isreviewd,
			(select rating from apprating where id = trending.id and type=trending.type) as rating_by_app
			from trending where date='${a}' order by popularity desc limit 20;`
		)

		res.status(200).json({ success: true, results: rows })
	})
)
router.get(
	'/movies',
	asyncHandler(async (req, res, next) => {
		const { query, username, lang, year } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		if (lang === undefined && year === undefined) {

			console.log('no language and year')
			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'movie' as type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = movies.id and reviews.movie->>'type'='movie')
			     ) as isreviewd
			from movies where (lower(searchtext) like '%${query}%'  or lower(title) like '%${query}%') 
			order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else if (lang === undefined && year !== undefined) {

			console.log('no language but year')
			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'movie' as type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = movies.id and reviews.movie->>'type'='movie')
			     ) as isreviewd
			from movies where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
			 and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else if (lang !== undefined && year === undefined) {

			console.log('language but no year')
			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'movie' as type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = movies.id and reviews.movie->>'type'='movie')
			     ) as isreviewd
			from movies where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%') 
			and language='${lang}' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else {

			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'movie' as type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = movies.id and reviews.movie->>'type'='movie')
			     ) as isreviewd
			from movies where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%') 
			and release like '${year}%' and language='${lang}' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		}


	})
)
router.get(
	'/tv',
	asyncHandler(async (req, res, next) => {
		const { query, username, lang, year } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		if (lang === undefined && year === undefined) {

			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'tv' as type
			,    (exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		    and reviews.movie->>'id' = tvshows.id and reviews.movie->>'type'='tv')
			     ) as isreviewd
			from tvshows where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%') order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else if (lang === undefined && year !== undefined) {

			console.log('no language but year')
			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'tv' as type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = tvshows.id and reviews.movie->>'type'='tv')
			     ) as isreviewd
			from tvshows where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%') 
			and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else if (lang !== undefined && year === undefined) {

			console.log('language but no year')
			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'tv' as type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = tvshows.id and reviews.movie->>'type'='tv')
			     ) as isreviewd
			from tvshows where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%')
			 and language='${lang}' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else {

			const { rows } = await pool.query(
				`select id,title,rating,poster,release,'tv' as type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = tvshows.id and reviews.movie->>'type'='tv')
			     ) as isreviewd
			from tvshows where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%') 
			and release like '${year}%' and language='${lang}' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		}


	})
)
router.get(
	'/anime',
	asyncHandler(async (req, res, next) => {
		const { query, username, year } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		if (year !== undefined) {

			console.log('no language but year')
			const { rows } = await pool.query(
				`select id,title,rating,poster,release,type,
			(exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		      and reviews.movie->>'id' = anime.id and reviews.movie->>'type'=anime.type)
			     ) as isreviewd
			from anime where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%') 
			and release like '${year}%' order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		} else {

			const { rows } = await pool.query(
				`select id,title,rating,poster,release,type
			,    (exists  (select 1 from reviews
				where reviews.creator_username='${username}'
		    and reviews.movie->>'id' = anime.id and reviews.movie->>'type'=anime.type)
			     ) as isreviewd
			from anime where  (lower(searchtext) like '%${query}%' or lower(title) like '%${query}%') order by popularity desc offset $1 limit 20;`,
				[offset]
			)
			res.status(200).send({ success: true, results: rows })
		}
	})
)

router.get(
	'/full/movies',
	asyncHandler(async (req, res, next) => {
		const { query, username } = req.query
		const { page } = req.query

		axios
			.get(
				baseUrl + 'search/movie' + api_key + `&page=${page + 1}&query=${query}`
			)
			.then(async (data) => {
				res.status(200).json({
					success: true,
					results: data.data.results.map((movie) => {
						return {
							id: movie.id,
							title: movie.title,
							release: movie.release_date,
							rating: movie.vote_average,
							poster: movie.poster_path,
							language: movie.original_language,
							backdrop: movie.backdrop_path,
							overview: movie.overview,
							genre: movie.genre_ids,
							adult: false,
						}
					}),
				})
			})
			.catch((err) => {
				console.log(err)
				return res
					.status(500)
					.json({ success: false, message: 'Trending not fetched' })
			})
	})
)
router.get(
	'/full/tv',
	asyncHandler(async (req, res, next) => {
		const { query, username } = req.query
		const { page } = req.query
		axios
			.get(baseUrl + 'search/tv' + api_key + `&page=${page + 1}&query=${query}`)
			.then(async (data) => {
				res.status(200).json({
					success: true,
					results: data.data.results.map((movie) => {
						return {
							id: movie.id,
							title: movie.name,
							release: movie.release_date,
							rating: movie.vote_average,
							poster: movie.poster_path,
							language: movie.original_language,
							backdrop: movie.backdrop_path,
							overview: movie.overview,
							genre: movie.genre_ids,
							adult: false,
						}
					}),
				})
			})
			.catch((err) => {
				console.log(err)
				return res
					.status(500)
					.json({ success: false, message: 'Trending not fetched' })
			})
	})
)

router.get(
	'/user',
	asyncHandler(async (req, res, next) => {
		const { query, username } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select id,username,avatar_url,display_name,
			critic,
			(exists  (select 1 from followers
				where followers.user_id=users.username and followers.follower_id ='${username}')
			     ) as isfollow
			from users where lower(display_name) like '%${query}%' or lower(username) like '%${query}%' order by isfollow desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).send({ success: true, results: rows })
	})
)


router.get(
	'/lists',
	asyncHandler(async (req, res, next) => {
		const { query, username } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			title,list_images,list_id,
			users.critic,
			(select count(*) from list_items where review_id=reviews.list_id),
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}'))
			reported FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			WHERE list_id is not null and (lower(title) like '%${query}%') 
			order by reviews.created_at desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).send({ success: true, results: formatResultV2(rows) })

	})
)

router.get(
	'/hashtags',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query
		const { rows } = await pool.query(
			`select name from hashtags where lower(name) like '${query}%' limit 20;`
		)
		res.status(200).send({ success: true, results: rows })
	})
)
router.get(
	'/username',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query
		const { rows } = await pool.query(
			`select username,display_name from users where lower(username) like '${query}%' limit 20;`
		)
		res.status(200).send({ success: true, results: rows })
	})
)
router.get(
	'/lists/user/:id',
	asyncHandler(async (req, res, next) => {
		const { username } = req.query
		const { page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			title,list_images,list_id,
			users.critic,
			(select count(*) from list_items where review_id=reviews.list_id),
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}'))
			reported FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			WHERE list_id is not null and creator_username='${req.params.id}'
			order by reviews.created_at desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).send({ success: true, results: formatResultV2(rows) })

	})
)

function formatResultV2(rows, isFollow) {
	return rows.map((row) => {
		return {
			id: row.id,
			creator_username: row.creator_username,
			display_name: row.display_name,
			avatar_url: row.avatar_url,
			movie: row.movie,
			media: row.media,
			likes: row.likes,
			replies: row.replies,
			repling_to: row.repling_to,
			mentions: row.mentions,
			body: row.body,
			isLiked: row.liked,
			isReported: row.reported,
			thought_on: row.thought_on,
			isFollow: isFollow,
			title: row.title,
			list_id: row.list_id,
			list_images: row.list_images,
			count: row.count,
			critic: row.critic,
			created_at: formateTime(row.created_at),
		}
	})
}

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
export default router
