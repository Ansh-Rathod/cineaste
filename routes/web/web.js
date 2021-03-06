import express from 'express'
import pool from '../../db.js'
import asyncHandler from '../../methods/async-function.js'
const router = express.Router()

router.get(
	'/movie/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { rows } = await pool.query(
			`select title,poster,overview,id from movies where id=$1;`,

			[id]
		)
		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)
router.get(
	'/tv/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { rows } = await pool.query(
			`select title,poster,overview,id from tvshows where id=$1;`,

			[id]
		)
		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)
router.get(
	'/user/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { rows } = await pool.query(
			`select display_name,username,bio,avatar_url from users where username=$1;`,

			[id]
		)
		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)
router.get(
	'/user/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { rows } = await pool.query(
			`select display_name,username,bio,avatar_url from users where username=$1;`,

			[id]
		)
		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)
router.get(
	'/reviews/:id',
	asyncHandler(async (req, res, next) => {
		const { id } = req.params
		const { rows } = await pool.query(
			`select display_name,username,bio,avatar_url from users where username=(select creator_username from reviews where id=$1);`,

			[id]
		)
		res.status(200).send({
			success: true,
			results: rows,
		})
	})
)

export default router
