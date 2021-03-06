import cloudinary from 'cloudinary'
import express from 'express'
import formidable from 'formidable'
import asyncHandler from './../../methods/async-function.js'

const { IncomingForm } = formidable

cloudinary.v2.config({
	cloud_name: 'cineaste-app',
	api_key: '116695171523723',
	api_secret: 'TWGTAsRUbKtUeN2MrLsZCspPjK4',
})

const router = express.Router()

router.post(
	'/image',
	asyncHandler(async (req, res, next) => {
		const data = await new Promise((resolve, reject) => {
			const form = new IncomingForm()
			form.parse(req, (err, fields, files) => {
				if (err) return reject(err)
				resolve({ fields, files })
			})
		})
		console.log(data.files.picture.filepath)
		var result = await cloudinary.v2.uploader.upload(
			data.files.picture.filepath,
			{
				folder: 'CINEASTE',
			}
		)

		res.status(202).json({
			success: true,
			url: result.secure_url,
			result: {
				url: result.secure_url,
				width: result.width,
				height: result.height,
			},
			data: result,
		})
	})
)

export default router
