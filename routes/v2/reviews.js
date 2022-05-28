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

function formatResult(rows, isFollow) {
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
			created_at: formateTime(row.created_at),
		}
	})
}
router.get(
	'/feed',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query

		let followerOffset = (page ?? 0) * 20
		let nonFollowerOffset = (page ?? 0) * 10

		const followers = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			WHERE creator_username IN 
			(SELECT user_id FROM followers WHERE follower_id='${username}')
			order by reviews.created_at desc offset $1 limit 20;`,
			[followerOffset]
		)

		const notFollowers = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			WHERE creator_username NOT IN 
			(SELECT user_id FROM followers WHERE follower_id='${username}')
                  and movie is null 
			and repling_to='{}'
			order by reviews.created_at desc offset $1 limit 10;`,
			[nonFollowerOffset]
		)

		function compare(a, b) {
			if (a.created_at < b.created_at) {
				return 1
			}
			if (a.created_at > b.created_at) {
				return -1
			}
			return 0
		}

		res.status(200).json({
			success: true,
			results: [
				...formatResult(followers.rows, true),
				...formatResult(notFollowers.rows, false),
			].sort(compare),
		})
	})
)

export default router
