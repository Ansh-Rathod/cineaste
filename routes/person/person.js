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
	'/:id',
	asyncHandler(async (req, res, next) => {
		var date = new Date().toLocaleString('en', {
			timeZoneName: 'short',
			timeZone: 'Europe/Amsterdam',
		})
		var currentdate = new Date(date)

		var week = getWeek(currentdate)

		const { rows } = await pool.query(
			`select * from person where id = '${req.params.id}' and week_num = '${week}'`
		)

		if (rows.length === 0) {
			axios
				.get(
					baseUrl +
						'/person/' +
						req.params.id +
						api_key +
						'&append_to_response=movie_credits,tv_credits,external_ids'
				)
				.then(async (response) => {
					const { data } = response

					await pool.query(`delete from person where id = '${req.params.id}'`)
					const insertedData = await pool.query(
						`insert into person (
					birthday,
					deathday,
					gender,
					id,
					imdb_id,
					name,
					place_of_birth,
					profile_path,
					biography,  
					movies,
					tvshows,
					external_ids,
					week_num
				)values($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning * ;`,
						[
							data.birthday,
							data.deathday,
							data.gender,
							data.id,
							data.imdb_id,
							data.name,
							data.place_of_birth,
							data.profile_path,
							data.biography,
							{
								cast: data.movie_credits.cast.length,
								crew: data.movie_credits.crew.length,
								results: [
									...data.movie_credits.cast.map((movie) => {
										return {
											id: movie.id,
											vote_average: movie.vote_average,
											release_date: movie.release_date,
											character: movie.character,
											title: movie.title,
											poster_path: movie.poster_path,
										}
									}),
									...data.movie_credits.crew.map((movie) => {
										return {
											id: movie.id,
											vote_average: movie.vote_average,
											release_date: movie.release_date,
											job: movie.job,
											title: movie.title,
											poster_path: movie.poster_path,
										}
									}),
								],
							},
							{
								cast: data.tv_credits.cast.length,
								crew: data.tv_credits.crew.length,
								results: [
									...data.tv_credits.cast.map((movie) => {
										return {
											id: movie.id,
											vote_average: movie.vote_average,
											release_date: movie.first_air_date,
											character: movie.character,
											title: movie.name,
											poster_path: movie.poster_path,
										}
									}),
									...data.tv_credits.crew.map((movie) => {
										return {
											id: movie.id,
											vote_average: movie.vote_average,
											release_date: movie.first_air_date,
											job: movie.job,
											title: movie.name,
											poster_path: movie.poster_path,
										}
									}),
								],
							},
							data.external_ids,
							week,
						]
					)
					res.status(200).send({ success: true, results: insertedData.rows })
				})
				.catch((err) => {
					res.status(500).send({ success: false, message: err.message })
				})
		} else {
			res.status(200).send({ success: true, results: rows })
		}
	})
)
export default router
