import express from 'express'
import fs from 'fs'
const app = express.Router()
app.get(
	'/',

	async (req, res, next) => {
		fs.readFile('movies.json', async (err, data) => {
			if (err) throw err
			let student = JSON.parse(data)

			for (let index = 0; index <= student.length; index++) {
				fs.appendFile(
					'test.sql',
					`insert into movies (id,title,release,rating,poster,language,backdrop,overview,genres,popularity,adult)
				 values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (id) do update set title=$2,release=$3,rating=$4,poster=$5,language=$6,backdrop=$7,overview=$8,genres=$9,popularity=$10,adult=$11;`,
					function (err) {
						if (err) {
							res
								.status(500)
								.json({ success: false, message: 'Trending not fetched' })
						} else {
							res
								.status(200)
								.json({ success: true, message: 'Trending fetched' })

							// done
						}
					}
				)
				const movie = student[index]
				// await pool.query(
				// 	`insert into movies (id,title,release,rating,poster,language,backdrop,overview,genres,popularity,adult) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (id) do update set title=$2,release=$3,rating=$4,poster=$5,language=$6,backdrop=$7,overview=$8,genres=$9,popularity=$10,adult=$11;`,
				// 	[
				// 		movie.id,
				// 		movie.title,
				// 		movie.release,
				// 		movie.rating,
				// 		movie.poster,
				// 		movie.language,
				// 		movie.backdrop,
				// 		movie.overview,
				// 		movie.genres,
				// 		movie.popularity,
				// 		movie.adult,
				// 	]
				// )

				console.log(`>>>>  total  pages of ${index} scraped..`)
			}

			res.json(student[0].release)
		})
	}
)

export default app
