import axios from 'axios'
import express from 'express'
import moment from 'moment-timezone'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
import getWeek from '../../methods/calculate_week.js'
const router = express.Router()
moment().tz('America/Los_Angeles').format()

const baseUrl = 'https://api.themoviedb.org/3/'
const api_key = '?api_key=b6e66a75ceca7996c5772ddd0656dd1b'

router.get(
	'/trending',
	asyncHandler(async (req, res, next) => {
		var a = moment.tz(new Date(), 'America/Los_Angeles').format('YYYY-MM-DD')
		const { rows } = await pool.query(
			`select id,title,release,rating,poster,language,backdrop,overview,genres,
			(select rating from apprating where id = trending.id and type='tv') as rating_by_app
			from trending where date='${a}' and type='tv'`
		)
		if (rows.length === 0) {
			axios
				.get(baseUrl + 'trending/tv/day' + api_key + '&page=1')
				.then(async (data) => {
					await pool.query(`delete from trending where type='tv';`)
					for (let index = 0; index < data.data.results.length; index++) {
						const movie = data.data.results[index]
						await pool.query(
							`insert into trending 
						(id,
						 title,
             release,
						 rating,
						 poster,
						 language,
						 backdrop,
						 overview,
						 genres,
						 date,
						 type,
						 popularity
						 )
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12);`,
							[
								movie.id,
								movie.name,
								movie.first_air_date,
								movie.vote_average,
								movie.poster_path,
								movie.original_language,
								movie.backdrop_path,
								movie.overview,
								movie.genre_ids,
								a,
								'tv',
								movie.popularity,
							]
						)
					}
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
		} else {
			res.status(200).json({ success: true, results: rows })
		}
	})
)

router.get(
	'/by/language',
	asyncHandler(async (req, res, next) => {
		const { language } = req.query
		const { rows } = await pool.query(
			`select id,
			title,
			release,
			poster,
			rating from tvshows
			where language =$1 and poster is not null and rating > 4 and release like '2022%' order by random() limit 20;`,
			[language]
		)

		res.status(200).json({ success: true, results: rows })
	})
)

function buildImages(imgs) {
	const { backdrops, logos, posters } = imgs
	let allimgs = []

	const backdrops_imgs = backdrops.map((img) => {
		return {
			file_path: img.file_path,
		}
	})
	const poster_imgs = posters.map((img) => {
		return { file_path: img.file_path }
	})
	const logo_imgs = logos.map((img) => {
		return { file_path: img.file_path }
	})
	allimgs = allimgs.concat(backdrops_imgs, poster_imgs, logo_imgs)

	return allimgs
}

router.get(
	'/:id',
	asyncHandler(async (req, res, next) => {
		var date = new Date().toLocaleString('en', {
			timeZoneName: 'short',
			timeZone: 'Europe/Amsterdam',
		})
		var currentdate = new Date(date)
		const { username } = req.query
		var week = getWeek(currentdate)
		const { rows } = await pool.query(
			`select *,
			(exists  (select 1 from favorites where favorites.username='${username}' and favorites.media_id = tv_info.id and favorites.media_type='tv')) as isFavorited,
			(exists  (select 1 from watchlist where watchlist.username='${username}' and watchlist.media_id = tv_info.id and watchlist.media_type='tv')) as iswatchlisted,
			(exists  (select 1 from watched where watched.username='${username}' and watched.media_id = tv_info.id and watched.media_type='tv')) as iswatched,
			(exists  (select 1 from reviews where reviews.creator_username='${username}' and reviews.movie->>'id' = tv_info.id and reviews.movie->>'type'='tv')) as isReviewd,
			(select rating from apprating where id = tv_info.id and type='tv') as rating_by_app
			from tv_info where id='${req.params.id}' and week_num='${week}'; `
		)

		const watched = await pool.query(`select users.avatar_url,
		(select count(*) from watched where watched.media_id='${req.params.id}'and watched.media_type='tv'),

		 (exists  (select 1 from followers where followers.user_id=watched.username and followers.follower_id ='${username}')) as isfollow
           from watched left join users on watched.username = users.username where watched.media_id='${req.params.id}' and media_type='tv' order by isfollow desc limit 5;`);


		if (rows.length === 0) {
			axios
				.get(
					baseUrl +
					'tv/' +
					req.params.id +
					api_key +
					'&append_to_response=videos,similar,credits,images,watch/providers'
				)
				.then(async (data) => {
					await pool.query(`delete from tv_info where id = '${req.params.id}';`)
					const { rows } = await pool.query(
						`insert into tv_Info (
							id,
							title,
							overview,
							poster_path,
							backdrop_path,
							release_date,
							language,
							popularity,
							seasons,
							episodes,
							tagline,
							vote_average,
							similar_shows,
							tv_cast,
							crew,
							videos,
							genres,
							production_countries,
							spoken_languages,
							week_num,
							images,
							providers
							)
							values
						($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) returning *,
						(exists  (select 1 from favorites
							where favorites.username='${username}'
					    and favorites.media_id = tv_info.id and favorites.media_type='tv')
						     ) as isFavorited,

		       	(exists  (select 1 from watchlist where watchlist.username='${username}' and watchlist.media_id = tv_info.id and watchlist.media_type='tv')) as iswatchlisted,
		      	(exists  (select 1 from watched where watched.username='${username}' and watched.media_id = tv_info.id and watched.media_type='tv')) as iswatched,

						     (exists  (select 1 from reviews
							where reviews.creator_username='${username}'
					    and reviews.movie->>'id' = tv_info.id and reviews.movie->>'type'='tv')
						     ) as isReviewd,
						(select rating from apprating where id = '${data.data.id}' and type='tv') as rating_by_app
						`,

						[
							data.data.id,
							data.data.name,
							data.data.overview,
							data.data.poster_path,
							data.data.backdrop_path,
							data.data.first_air_date,
							data.data.original_language,
							data.data.popularity,
							data.data.number_of_seasons,
							data.data.number_of_episodes,
							data.data.tagline,
							data.data.vote_average,
							{
								results: data.data.similar.results.map((movie) => {
									return {
										title: movie.name,
										id: movie.id,
										poster: movie.poster_path,
										rating: movie.vote_average,
									}
								}),
							},
							{
								results: data.data.credits.cast.map((cast) => {
									return {
										name: cast.name,
										id: cast.id,
										character: cast.character,
										image: cast.profile_path,
									}
								}),
							},
							{
								results: data.data.credits.crew.map((cast) => {
									return {
										name: cast.name,
										id: cast.id,
										job: cast.job,
										image: cast.profile_path,
									}
								}),
							},
							{
								results: data.data.videos.results.filter((vid) => {
									return (
										vid.site == 'YouTube' &&
										(vid.type == 'Teaser' || vid.type == 'Trailer')
									)
								}),
							},
							{ results: data.data.genres },
							{ results: data.data.production_countries },
							{ results: data.data.spoken_languages },
							week,
							{
								results: buildImages(data.data.images),
								posters: data.data.images.posters.map((img) => {
									return {
										file_path: img.file_path
									}
								})
								,
								backdrops: data.data.images.backdrops.map((img) => {
									return {
										file_path: img.file_path
									}
								}),
								logos: data.data.images.logos.map((img) => {
									return {
										file_path: img.file_path
									}
								})
							},
							{
								results: getWatchProvider(data.data['watch/providers'].results)

							}
						]
					)
					res.status(200).json({
						success: true, results: [{
							...rows[0],
							...{
								watchedCount: watched.rows.length !== 0 ? watched.rows[0].count : 0,
								watched: watched.rows.map(e => { return e.avatar_url })
							}
						}],

					})
				})
				.catch((err) => {
					console.log(err)
					return res
						.status(500)
						.json({ success: false, message: 'mvoie info not found' })
				})
		} else {
			res.status(200).json({
				success: true, results: [{
					...rows[0],
					...{
						watchedCount: watched.rows.length !== 0 ? watched.rows[0].count : 0,
						watched: watched.rows.map(e => { return e.avatar_url })
					}
				}],

			})
		}
	})
)


function getWatchProvider(data) {
	let alldata = []
	for (let property in data) {

		alldata.push({
			country: property,
			logo: data[property].flatrate[0].logo_path,
			priority: data[property].flatrate[0].display_priority,
			name: data[property].flatrate[0].provider_name
		})

	}
	return alldata
}


export default router
