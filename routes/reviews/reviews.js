import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
import dateFormat from '../../methods/get_time.js'

const router = express.Router()

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
			created_at: dateFormat(new Date(row.created_at), 'yyyy-mm-dd HH:MM:ss'),
		}
	})
}
router.post(
	'/new',
	asyncHandler(async (req, res, next) => {
		const { rows } = await pool.query(
			`insert into reviews (creator_username,body,media,movie,repling_to,thought_on) values ($1,$2,$3,$4,$5,$6) returning *`,
			[
				req.body.username,
				req.body.body,
				req.body.media,
				req.body.movie,
				req.body.repling_to,
				req.body.thought_on,
			]
		)
		if (req.body.isReply) {
			await pool.query(
				`insert into replies (review_id,reply_id) values ($1,$2);`,
				[req.body.repling_to_review_id, rows[0].id]
			)
		}
		res.status(201).json({ success: true, results: rows[0] })
	})
)

router.get(
	'/feed',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,thought_on,
			(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where report_reviews.review_id=reviews.id and report_reviews.reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			 WHERE creator_username IN 
			(SELECT user_id FROM followers WHERE follower_id='${username}')and repling_to='{}' order by reviews.created_at desc offset $1 limit 20 ;

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

router.put(
	'/like',
	asyncHandler(async (req, res, next) => {
		const { username, id } = req.query
		await pool.query(`insert into liked (review_id,user_id) values ($1,$2)`, [
			id,
			username,
		])
		res.status(200).json({ success: true })
	})
)

router.put(
	'/unlike',
	asyncHandler(async (req, res, next) => {
		const { username, id } = req.query
		await pool.query(`delete from liked where review_id= $1 and user_id =$2;`, [
			id,
			username,
		])
		res.status(200).json({ success: true })
	})
)

router.get(
	'/user/:id/thoughts',
	asyncHandler(async (req, res, next) => {
		const { page, username } = req.query
		const { id } = req.params

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,
			thought_on,(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			 WHERE creator_username ='${id}' and repling_to='{}' and movie is null order by reviews.created_at desc offset $1 limit 20;
			`,
			[offset]
		)
		res.status(200).json({ success: true, results: formatResult(rows) })
	})
)
router.get(
	'/user/:id/reviews',
	asyncHandler(async (req, res, next) => {
		const { page, username } = req.query
		const { id } = req.params

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,
			thought_on,(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}'))
			reported
			FROM reviews 
			LEFT JOIN users on reviews.creator_username=users.username  
			 WHERE creator_username ='${id}' and repling_to='{}' and movie is not null order by reviews.created_at desc offset $1 limit 20;
			`,
			[offset]
		)
		res.status(200).json({ success: true, results: formatResult(rows) })
	})
)

router.get(
	'/replies',
	asyncHandler(async (req, res, next) => {
		const { id, page, username } = req.query
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`
			select reviews.id,creator_username,display_name,avatar_url,media,
			thought_on,likes,replies,body,reviews.created_at,repling_to,mentions,
			(exists  (select 1 from liked
				where liked.user_id='${username}' and liked.review_id =reviews.id)
			     ) as liked,
			(exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}'))
			reported
			from replies left join reviews on replies.reply_id=reviews.id
			left join users on reviews.creator_username =users.username
			where review_id = '${id}'
			order by created_at desc offset $1 limit 20;`,

			[offset]
		)
		res.status(200).json({
			success: true,
			results: formatResult(rows),
		})
	})
)

router.get(
	'/movie/:id',
	asyncHandler(async function (req, res, next) {
		const { id } = req.params
		const { page, type, username } = req.query

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(`
		SELECT reviews.id,creator_username,display_name,avatar_url,movie,media,likes,replies,body,reviews.created_at,repling_to,mentions,
		(exists  (select 1 from liked
			where liked.user_id='${username}' and liked.review_id =reviews.id)
		     ) as liked,
		     (exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}'))
		     reported
		FROM reviews 
		LEFT JOIN users on reviews.creator_username=users.username
		WHERE movie->>'id'= '${id}'and movie->>'type'='${type}' order by created_at desc offset '${offset}' limit 20;`)

		res.status(200).json({
			success: true,
			results: formatResult(rows),
		})
	})
)

router.get(
	'/movie/:id/thoughts',
	asyncHandler(async function (req, res, next) {
		const { id } = req.params
		const { page, type, username } = req.query

		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(`
		SELECT reviews.id,creator_username,display_name,avatar_url,media,likes,replies,body,reviews.created_at,repling_to,mentions,
		thought_on,
		(exists  (select 1 from liked
			where liked.user_id='${username}' and liked.review_id =reviews.id)
		     ) as liked,
		     (exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}'))
		     reported
		FROM reviews 
		LEFT JOIN users on reviews.creator_username=users.username
		WHERE thought_on->>'id'= '${id}'and thought_on->>'type'='${type}' order by created_at desc offset '${offset}' limit 20;`)

		res.status(200).json({
			success: true,
			results: formatResult(rows),
		})
	})
)

router.delete(
	'/:id/delete',
	asyncHandler(async (req, res, next) => {
		await pool.query(`delete from reviews where id = '${req.params.id}'`)

		res.status(202).json({
			success: true,
		})
	})
)

router.get(
	'/liked/review/:id',
	asyncHandler(async (req, res, next) => {
		const { username, page } = req.query
		const { id } = req.params
		const offset = (page ?? 0) * 20
		const { rows } = await pool.query(
			`select display_name,avatar_url,username,
		(exists  (select 1 from followers where followers.user_id=users.username
		and followers.follower_id = '${username}')) as isfollow
		from liked left join users on liked.user_id=users.username
	      where review_id='${id}' offset $1 limit 20;`,

			[offset]
		)
		res.status(200).json({
			success: true,
			results: rows,
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
			thought_on,likes,replies,body,reviews.created_at,repling_to,mentions,
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}')) reported
			from reviews 
			left join users on reviews.creator_username =users.username where
			reviews.id=(select review_id from replies where reply_id='${id}' );
			`
		)

		res.status(200).send({ success: true, results: formatResult(rows) })
	})
)

router.get(
	'/review/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { username } = req.query
		const { rows } = await pool.query(
			`select reviews.id,creator_username,display_name,avatar_url,media,
			movie,
			thought_on,likes,replies,body,reviews.created_at,repling_to,mentions,
			(exists  (select 1 from liked where liked.user_id='${username}' and liked.review_id =reviews.id)) as liked,
			(exists (select 1 from report_reviews where review_id=reviews.id and reportd_by='${username}')) reported
			from reviews 
			left join users on reviews.creator_username =users.username where
			reviews.id='${id}';
			`
		)

		res.status(200).send({ success: true, results: formatResult(rows) })
	})
)

export default router
