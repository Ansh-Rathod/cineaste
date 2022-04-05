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
function formatResult(rows) {
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
			created_at: formateTime(row.created_at),
		}
	})
}
router.get(
	'/hashtags',
	asyncHandler(async (req, res, next) => {
		const { rows } = await pool.query(
			`select tags from reviews where created_at > current_date - interval '1 days';`
		)
		let allHashtags = []
		rows.forEach((row) => {
			let sorted = [...new Set(row.tags)]
			for (let i = 0; i < sorted.length; i++) {
				allHashtags.push(sorted[i])
			}
		})

		var count = {}
		allHashtags.forEach(function (i) {
			count[i] = (count[i] || 0) + 1
		})
		var sortable = []
		for (var tag in count) {
			sortable.push([tag, count[tag]])
		}
		sortable.sort(function (a, b) {
			return b[1] - a[1]
		})
		let trending = []
		sortable.forEach((tag) => {
			trending.push({ name: tag[0], reviews: tag[1] })
		})
		res.status(200).send({ results: trending.slice(0, 5) })
	})
)

router.get(
	'/reviews',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}')) reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			where created_at > current_date - interval '2 days' and movie is not null 
                  order by likes desc offset $1 limit 20;
			`,
			[offset]
		)
		console.log()
		res.status(200).json({
			success: true,
			results: formatResult(rows),
		})
	})
)
router.get(
	'/thoughts',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}')) reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  

			where created_at > current_date - interval '2 days' and repling_to='{}'
			order by likes desc offset $1 limit 20;
			`,
			[offset]
		)
		console.log()
		res.status(200).json({
			success: true,
			results: formatResult(rows),
		})
	})
)

router.get(
	'/hashtags/:id/reviews',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { username, page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}')) reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username 
			where '${id}'= ANY(tags) 
                  order by created_at desc offset $1 limit 20;`,
			[offset]
		)

		res.status(200).json({ success: true, results: formatResult(rows) })
	})
)
router.get(
	'/hashtags/:id/thoughts',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { username, page } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}')) reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username 
			where '${id}'= ANY(tags) and movie is null
                  order by created_at desc offset $1 limit 20;`,
			[offset]
		)

		res.status(200).json({ success: true, results: formatResult(rows) })
	})
)

export default router
