import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.post(
  '/add',
  asyncHandler(async (req, res, next) => {
    const { username, media_id, media_type, media_title, media_poster, media_rating } =
      req.body
    await pool.query(
      `insert into watched (	
                        username,
                        media_id,
                        media_type,
                        media_title,
                        media_poster,
                        media_rating
                        ) values($1,$2,$3,$4,$5,$6);`,

      [username, media_id, media_type, media_title, media_poster, media_rating]
    )

    res.status(200).send({
      success: true,
    })
  })
)

router.post(
  '/update',
  asyncHandler(async (req, res, next) => {
    const { username, media_id, media_type, media_rating } =
      req.body
    await pool.query(
      `update watched set media_rating=$1 where username=$2 and media_id=$3 and media_type=$4;`,
      [media_rating, username, media_id, media_type]
    )

    res.status(200).send({
      success: true,
    })
  })
)
router.delete(
  '/remove',
  asyncHandler(async (req, res, next) => {
    const { username, media_id } = req.query
    await pool.query(
      `delete from watched 	where 
                        username=$1 and
                        media_id=$2;`,

      [username, media_id]
    )
    res.status(200).send({
      success: true,
    })
  })
)


router.get(
  '/movies/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { username, page, type } = req.query
    const offset = (page ?? 0) * 20
    const { rows } = await pool.query(
      `select watched.username,display_name,avatar_url,critic, media_rating, 
      watched.created,
      (select id from reviews where reviews.creator_username=watched.username
      and reviews.movie->>'id' = watched.media_id and reviews.movie->>'type'=watched.media_type) as iswriten,
      (exists  (select 1 from followers
      where followers.user_id=users.username
      and followers.follower_id = '${username}')
      ) as isfollow
      from watched
      left join users on watched.username=users.username where media_id=$1 and media_type=$3 order by isfollow desc offset $2 limit 20;`,
      [id, offset, type]
    )

    res.status(200).send({
      success: true,
      results: formatResult(rows),
    })
  })
)

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
      media_rating: row.media_rating,
      username: row.username,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      isfollow: row.isfollow,
      critic: row.critic,
      iswriten: row.iswriten,
      created: formateTime(row.created),
    }
  })
}


export default router
