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
		var a = moment.tz(new Date(), 'America/Los_Angeles').format('YYYY-MM-DD')

		const { rows } = await pool.query(
			`select id,title,release,rating,poster,type,
			(select rating from apprating where id = trending.id and type=trending.type) as rating_by_app
			from trending where date='${a}' order by popularity desc limit 20;`
		)

		res.status(200).json({ success: true, results: rows })
	})
)
router.get(
	'/movies',
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
			from movies where lower(title) like '%${query}%' order by popularity desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).send({ success: true, results: rows })
	})
)
router.get(
	'/tv',
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
			from tvshows where lower(title) like '%${query}%' order by popularity desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).send({ success: true, results: rows })
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

export default router
