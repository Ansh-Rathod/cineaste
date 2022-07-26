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
			critic: row.critic,
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


router.get(
	'/feed',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query

		let followerOffset = (page ?? 0) * 20
		let nonFollowerOffset = (page ?? 0) * 15

		const followers = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			WHERE creator_username IN 
			(SELECT user_id FROM followers WHERE follower_id='${username}') and title is null
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
      and movie is null and title is null
			and repling_to='{}' 
			and created_at > current_date - interval '30 days' 
			order by reviews.likes desc offset $1 limit 10;`,
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
router.get(
	'/feed/v2',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query

		let followerOffset = (page ?? 0) * 20
		let nonFollowerOffset = (page ?? 0) * 10

		const followers = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			title,list_images,list_id,
			users.critic,
			(select count(*) from list_items where review_id=reviews.list_id),
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
			title,list_images,list_id,
			users.critic,
			(select count(*) from list_items where review_id=reviews.list_id),
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			WHERE creator_username NOT IN 
			(SELECT user_id FROM followers WHERE follower_id='${username}')
                  and movie is null 
			and repling_to='{}' 
			and created_at > current_date - interval '10 days' 
			order by reviews.likes desc offset $1 limit 10;`,
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
				...formatResultV2(followers.rows, true),
				...formatResultV2(notFollowers.rows, false),
			].sort(compare),
		})
	})
)

router.get(
	'/previous/reply/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { username } = req.query
		const { rows } = await pool.query(
			`select reviews.id,creator_username,display_name,avatar_url,media,
			movie,
			title,list_images,list_id,
			users.critic,
			(select count(*) from list_items where review_id=reviews.list_id),
			thought_on,likes,replies,body,reviews.created_at,repling_to,mentions,
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}')) reported
			from reviews 
			left join users on reviews.creator_username =users.username where
			reviews.id=(select review_id from replies where reply_id='${id}' );
			`
		)

		res.status(200).send({ success: true, results: formatResultV2(rows) })
	})
)
router.get(
	'/user/:id',
	asyncHandler(async (req, res, next) => {
		const { page, username } = req.query
		const { id } = req.params

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,
			thought_on,(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			users.critic,
			(exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			 WHERE creator_username ='${id}' and repling_to='{}' and list_id is null order by reviews.created_at desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).json({ success: true, results: formatResult(rows) })
	})
)


router.get(
	'/user/popular/following',
	asyncHandler(async (req, res, next) => {
		const { page, username } = req.query

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select media_id,media_type,media_title,media_poster,media_rating as user_rating,username,
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
					  (select id from reviews where reviews.creator_username=watched.username
      and reviews.movie->>'id' = watched.media_id and reviews.movie->>'type'=watched.media_type) as iswriten,
					(exists  (select 1 from reviews where reviews.creator_username='${username}'
					and reviews.movie->>'id' = watched.media_id and reviews.movie->>'type'=watched.media_type)) as isreviewd
					,(select rating from apprating where id = watched.media_id and type=watched.media_type) as rating_by_app 
					from watched where username in (SELECT user_id FROM followers WHERE follower_id='${username}')
					and media_rating !=0.0 and created > current_date - interval '7 days' order by created desc offset $1 limit 20;`,
			[offset]
		)
		res.status(200).json({ success: true, results: rows })
	})
)



export default router
