import axios from 'axios'
import express from 'express'
import moment from 'moment-timezone'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'

moment().tz('America/Los_Angeles').format()

const router = express.Router()

router.get(
	'/trending',
	asyncHandler(async (req, res, next) => {
		var a = moment.tz(new Date(), 'America/Los_Angeles').format('YYYY-MM-DD')
		const { rows } = await pool.query(`select * from gifs where week ='${a}'`)
		if (rows.length === 0) {
			axios
				.get(`https://g.tenor.com/v1/trending?key=LIVDSRZULELA&limit=50`)
				.then(async (data) => {
					for (let index = 0; index < data.data.results.length; index++) {
						const gif = data.data.results[index]
						await pool.query(
							`insert into gifs 
                                    (url,
                                     tenor_id,
                                     content_description,
                                     preview_url,
                                     dims,
                                     week)
                                values ($1,$2,$3,$4,$5,$6) 
                                ;`,
							[
								gif.media[0].gif.url,
								gif.id,
								gif.content_description,
								gif.media[0].gif.preview,
								{ data: gif.media[0].gif.dims },
								a,
							]
						)
					}
					const results = await pool.query(
						`select * from gifs where week ='${a}'`
					)

					res.status(200).json({ success: true, results: results.rows })
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
	'/search/:query',
	asyncHandler(async (req, res, next) => {
		const { pos } = req.query
		axios
			.get(
				`https://g.tenor.com/v1/search?q=${req.params.query}&key=LIVDSRZULELA&limit=50`
			)

			.then(async (data) => {
				res.status(200).json({
					success: true,
					next: data.data.next,
					results: data.data.results.map((result) => formatResult(result)),
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

function formatResult(result) {
	return {
		url: result.media[0].gif.url,
		tenor_id: result.id,
		content_description: result.content_description,
		preview_url: result.media[0].gif.preview,
		dims: result.media[0].gif.dims,
	}
}
export default router
