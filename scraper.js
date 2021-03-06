import axios from 'axios'
import express from 'express'
import pool from './db.js'
import asyncHandler from './methods/async-function.js'

const app = express.Router()

const endpoints = [

	// {
	// 	start: '2000-01-01',
	// 	end: '2000-12-31',
	// 	page: 319,
	// },
	// {
	// 	start: '2001-01-01',
	// 	end: '2001-12-31',
	// 	page: 353,
	// },
	// {
	// 	start: '2002-01-01',
	// 	end: '2002-12-31',
	// 	page: 393,
	// },
	// {
	// 	start: '2003-01-01',
	// 	end: '2003-12-31',
	// 	page: 445,
	// },
	// {
	// 	start: '2004-01-01',
	// 	end: '2004-12-31',
	// 	page: 491,
	// },
	// {
	// 	start: '2005-01-01',
	// 	end: '2005-11-01',
	// 	page: 478,
	// },
	// {
	// 	start: '2005-11-01',
	// 	end: '2005-12-31',
	// 	page: 83,
	// },
	// {
	// 	start: '2006-01-01',
	// 	end: '2006-07-31',
	// 	page: 388,
	// },
	// {
	// 	start: '2006-07-01',
	// 	end: '2006-12-31',
	// 	page: 229,
	// },
	// {
	// 	start: '2007-01-01',
	// 	end: '2007-07-31',
	// 	page: 410,
	// },
	// {
	// 	start: '2007-07-31',
	// 	end: '2007-12-31',
	// 	page: 241,
	// },

	// {
	// 	start: '2008-01-01',
	// 	end: '2008-07-31',
	// 	page: 418,
	// },
	// {
	// 	start: '2008-07-31',
	// 	end: '2008-12-31',
	// 	page: 271,
	// },
	// {
	// 	start: '2009-01-01',
	// 	end: '2009-07-31',
	// 	page: 443,
	// },
	// {
	// 	start: '2009-07-01',
	// 	end: '2009-12-31',
	// 	page: 284,
	// },
	// {
	// 	start: '2010-01-01',
	// 	end: '2010-07-31',
	// 	page: 461,
	// },
	// {
	// 	start: '2010-07-31',
	// 	end: '2010-12-31',
	// 	page: 296,
	// },
	// {
	// 	start: '2011-01-01',
	// 	end: '2011-06-30',
	// 	page: 448,
	// },
	// {
	// 	start: '2011-06-30',
	// 	end: '2011-12-31',
	// 	page: 379,
	// },
	// {
	// 	start: '2012-01-01',
	// 	end: '2012-06-30',
	// 	page: 483,
	// },
	// {
	// 	start: '2012-06-30',
	// 	end: '2012-12-31',
	// 	page: 419,
	// },
	// {
	// 	start: '2013-01-01',
	// 	end: '2013-06-20',
	// 	page: 497,
	// },
	// {
	// 	start: '2013-06-20',
	// 	end: '2013-12-20',
	// 	page: 484,
	// },
	// {
	// 	start: '2013-12-20',
	// 	end: '2013-12-31',
	// 	page: 30,
	// },
	// {
	// 	start: '2014-01-01',
	// 	end: '2014-05-31',
	// 	page: 480,
	// },
	// {
	// 	start: '2014-05-31',
	// 	end: '2014-10-31',
	// 	page: 426,
	// },
	// {
	// 	start: '2014-10-31',
	// 	end: '2014-12-31',
	// 	page: 186,
	// },
	// {
	// 	start: '2015-01-01',
	// 	end: '2015-05-31',
	// 	page: 500,
	// },
	// {
	// 	start: '2015-05-31',
	// 	end: '2015-10-31',
	// 	page: 452,
	// },
	// {
	// 	start: '2015-10-31',
	// 	end: '2015-12-31',
	// 	page: 192,
	// },
	// {
	// 	start: '2016-01-01',
	// 	end: '2016-05-01',
	// 	page: 442,
	// },
	// {
	// 	start: '2016-05-01',
	// 	end: '2016-09-30', //     Remaining form last from num 30
	// 	page: 440,
	// },
	// {
	// 	start: '2016-09-30',
	// 	end: '2016-12-31',
	// 	page: 331,
	// },
	// {
	// 	start: '2017-01-01',
	// 	end: '2017-05-01',
	// 	page: 478,
	// },
	// {
	// 	start: '2017-05-01',
	// 	end: '2017-09-30',
	// 	page: 497,
	// },
	// {
	// 	start: '2017-09-30',
	// 	end: '2017-12-31',
	// 	page: 382,
	// },
	// {
	// 	start: '2018-01-01',
	// 	end: '2018-05-01',
	// 	page: 490,
	// },
	// {
	// 	start: '2018-05-01',
	// 	end: '2018-09-15',
	// 	page: 485,
	// },
	// {
	// 	start: '2018-09-15',
	// 	end: '2018-12-31', //  Remail for 225
	// 	page: 466,
	// },
	// {
	// 	start: '2019-01-01',
	// 	end: '2016-04-25',
	// 	page: 493,
	// },
	// {
	// 	start: '2019-04-25',
	// 	end: '2019-08-31',
	// 	page: 492,
	// },
	// {
	// 	start: '2019-08-31',
	// 	end: '2019-11-31', //  443
	// 	page: 463,
	// },
	// {
	// 	start: '2019-11-30',
	// 	end: '2019-12-31',
	// 	page: 134,
	// },
	// {
	// 	start: '2020-01-01',
	// 	end: '2020-04-31',
	// 	page: 470,
	// },
	// {
	// 	start: '2020-04-30',
	// 	end: '2020-08-31',
	// 	page: 491,
	// },
	// {
	// 	start: '2020-08-30',
	// 	end: '2020-11-12',
	// 	page: 429,
	// },
	// {
	// 	start: '2020-11-12',
	// 	end: '2020-12-31',
	// 	page: 245,
	// },
	// {
	// 	start: '2021-01-01',
	// 	end: '2021-04-31',
	// 	page: 433,
	// },
	// {
	// 	start: '2021-04-31',
	// 	end: '2021-08-31',
	// 	page: 439,
	// },
	// {
	// 	start: '2021-08-31',
	// 	end: '2021-11-20',
	// 	page: 435,
	// },
	// {
	// 	start: '2021-11-20',
	// 	end: '2021-12-31',
	// 	page: 186,
	// },

	// {
	// 	start: '2019-01-01',
	// 	end: '2019-05-01',
	// 	page: 486,
	// },
	// {
	// 	start: '2019-05-01',
	// 	end: '2019-09-01',
	// 	page: 443,
	// },
	// {
	// 	start: '2019-09-01',
	// 	end: '2019-12-01',
	// 	page: 447,
	// },
	// {
	// 	start: '2019-12-01',
	// 	end: '2019-12-31',
	// 	page: 121,
	// },
	// {
	// 	start: '2022-01-01',
	// 	end: '2022-05-31',
	// 	page: 481,
	// },
	{
		start: '2022-05-01',
		end: '2022-12-31',
		page: 356,
	},
	// {
	// 	year: '2022',
	// 	page: 500,
	// },
	// {
	// 	year: '1990',
	// 	page: 293,
	// },
	// {
	// 	year: '1989',
	// 	page: 287,
	// },
	// {
	// 	year: '1988',
	// 	page: 278,
	// },
	// {
	// 	year: '1987',
	// 	page: 273,
	// },




	// { year: '1940', page: 87 },
	// { year: '1941', page: 85 },
	// { year: '1942', page: 83 },
	// { year: '1943', page: 81 },
	// { year: '1944', page: 72 },
	// { year: '1945', page: 74 },
	// { year: '1946', page: 75 },
	// { year: '1947', page: 81 },
	// { year: '1948', page: 89 },
	// { year: '1949', page: 102 },
	// { year: '1950', page: 104 },
	// { year: '1951', page: 105 },
	// { year: '1952', page: 105 },
	// { year: '1953', page: 110 },
	// { year: '1954', page: 110 },
	// { year: '1955', page: 117 },
	// { year: '1956', page: 125 },
	// { year: '1957', page: 129 },
	// { year: '1958', page: 139 },
	// { year: '1959', page: 137 },
	// { year: '1960', page: 144 },
	// { year: '1961', page: 145 },
	// { year: '1962', page: 144 },
	// { year: '1963', page: 151 },
	// { year: '1964', page: 162 },
	// { year: '1965', page: 174 },
	// { year: '1966', page: 175 },
	// { year: '1967', page: 192 },
	// { year: '1968', page: 201 },
	// { year: '1969', page: 211 },
	// { year: '1970', page: 214 },
	// { year: '1971', page: 213 },
	// { year: '1972', page: 222 },
	// { year: '1973', page: 216 },
	// { year: '1974', page: 225 },
	// { year: '1975', page: 213 },
	// { year: '1976', page: 210 },
	// { year: '1977', page: 211 },
	// { year: '1978', page: 224 },
	// { year: '1979', page: 234 },
	// { year: '1980', page: 228 },

	// { year: '1981', page: 243 },
	// { year: '1982', page: 255 },
	// { year: '1983', page: 254 },
	// { year: '1984', page: 266 },
	// { year: '1985', page: 261 },
	// { year: '1986', page: 266 },
	// { year: '1987', page: 280 }, 194
	// { year: '1988', page: 285 },
	// { year: '1989', page: 296 },
	// { year: '1990', page: 302 },
	// { year: '1991', page: 287 },
	// { year: '1992', page: 283 },
	// { year: '1993', page: 278 },
	// { year: '1994', page: 287 },
	// { year: '1995', page: 286 },
	// { year: '1996', page: 291 },
	// { year: '1997', page: 312 },
	// { year: '1998', page: 325 },
	// { year: '1999', page: 325 },
]
// `https://api.themoviedb.org/3/discover/movie?api_key=b6e66a75ceca7996c5772ddd0656dd1b&primary_release_date.gte=${endpoint.start}&primary_release_date.lte=${endpoint.end}&include_adult=true&page=${i}`


app.get(
	'/movies',
	asyncHandler(async (req, res, next) => {
		console.log(req.connection.remoteAddress)
		for (let j = 0; j < endpoints.length; j++) {
			var endpoint = endpoints[j]
			for (let i = 1; i <= endpoint.page; i++) {
				const { data } = await axios.get(
					`https://api.themoviedb.org/3/discover/movie?api_key=b6e66a75ceca7996c5772ddd0656dd1b&primary_release_date.gte=${endpoint.start}&primary_release_date.lte=${endpoint.end}&page=${i}`
				)

				for (let index = 0; index < data.results.length; index++) {
					const movie = data.results[index]
					await pool.query(
						`insert into movies 
						(id,
						 title,
						 release,
						 rating,
						 poster,
						 language,
						 backdrop,
						 overview,
						 genres,
						 popularity,
						 adult)
                               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                               on conflict (id) do update set 
					 title=$2,
					 release=$3,
					 rating=$4,
					 poster=$5,
					 language=$6,
					 backdrop=$7,
					 overview=$8,
					 genres=$9,
					 popularity=$10,
					 adult=$11;`,
						[
							movie.id,
							movie.title,
							movie.release_date,
							movie.vote_average,
							movie.poster_path,
							movie.original_language,
							movie.backdrop_path,
							movie.overview,
							movie.genre_ids,
							movie.popularity,
							movie.adult,
						]
					)
				}
				console.log(`>>>>  total ${endpoint.page}  ${endpoint.start} pages of ${i} scraped..`)
			}
			console.log(`\n completed//////\n\n\n\n`)
		}
		res.json('done')
	})
)


app.get(
	'/anime-movies',
	asyncHandler(async (req, res, next) => {
		console.log(req.connection.remoteAddress)

		for (let i = 1; i <= 80; i++) {
			const { data } = await axios.get(
				`https://api.themoviedb.org/3/discover/movie?api_key=b6e66a75ceca7996c5772ddd0656dd1b&include_adult=true&with_keywords=210024&page=${i}`
			)

			for (let index = 0; index < data.results.length; index++) {
				const movie = data.results[index]
				await pool.query(
					`insert into anime 
						(id,
						 title,
						 release,
						 rating,
						 poster,
						 language,
						 backdrop,
						 overview,
						 genres,
						 popularity,
						 adult,
						 type
						 )
                               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                               on conflict (id) do update set 
					 title=$2,
					 release=$3,
					 rating=$4,
					 poster=$5,
					 language=$6,
					 backdrop=$7,
					 overview=$8,
					 genres=$9,
					 popularity=$10,
					 adult=$11,
					 type=$12;`,

					[
						movie.id,
						movie.title,
						movie.release_date,
						movie.vote_average,
						movie.poster_path,
						movie.original_language,
						movie.backdrop_path,
						movie.overview,
						movie.genre_ids,
						movie.popularity,
						movie.adult,
						'movie'
					]
				)
			}
			console.log(`>>>>  total pages of ${i} scraped..`)
		}
		console.log(`\n completed//////\n\n\n\n`)

		res.json('done')
	}
	)
)



// app.get(
// 	'/movies',
// 	asyncHandler(async (req, res, next) => {
// 		console.log(req.connection.remoteAddress)
// 		for (let j = 0; j < endpoints.length; j++) {
// 			var endpoint = endpoints[j]
// 			for (let i = 1; i <= endpoint.page; i++) {
// 				const { data } = await axios.get(
// 					`https://api.themoviedb.org/3/discover/movie?api_key=b6e66a75ceca7996c5772ddd0656dd1b&page=${i.toString()}&include_adult=true&year=${endpoint.year}`)

// 				for (let index = 0; index < data.results.length; index++) {
// 					const movie = data.results[index]
// 					await pool.query(
// 						`insert into movies 
// 						(id,
// 						 title,
//                                      release,
// 						 rating,
// 						 poster,
// 						 language,
// 						 backdrop,
// 						 overview,
// 						 genres,
// 						 popularity,
// 						 adult)
//                                values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
//                                on conflict (id) do update set 
// 					 title=$2,
// 					 release=$3,
// 					 rating=$4,
// 					 poster=$5,
// 					 language=$6,
// 					 backdrop=$7,
// 					 overview=$8,
// 					 genres=$9,
// 					 popularity=$10,
// 					 adult=$11;`,
// 						[
// 							movie.id,
// 							movie.title,
// 							movie.release_date,
// 							movie.vote_average,
// 							movie.poster_path,
// 							movie.original_language,
// 							movie.backdrop_path,
// 							movie.overview,
// 							movie.genre_ids,
// 							movie.popularity,
// 							movie.adult,
// 						]
// 					)
// 				}
// 				console.log(`>>>>  total ${endpoint.page} pages of ${i} scraped..`)
// 			}
// 			console.log(`\n completed//////\n\n\n\n`)
// 		}
// 		res.json('done')
// 	})
// )

const tvEndpoint = [
	// {
	// 	year: '1990',
	// 	page: 30,
	// },
	// {
	// 	year: '1991',
	// 	page: 31,
	// },
	// {
	// 	year: '1992',
	// 	page: 34,
	// },
	// {
	// 	year: '1993',
	// 	page: 33,
	// },
	// {
	// 	year: '1994',
	// 	page: 37,
	// },
	// {
	// 	year: '1995',
	// 	page: 40,
	// },
	// {
	// 	year: '1996',
	// 	page: 40,
	// },
	// {
	// 	year: '1997',
	// 	page: 45,
	// },
	// {
	// 	year: '1998',
	// 	page: 48,
	// },
	// {
	// 	year: '1999',
	// 	page: 50,
	// },
	// {
	// 	year: '2000',
	// 	page: 55,
	// },
	// {
	// 	year: '2001',
	// 	page: 60,
	// },
	// {
	// 	year: '2001',
	// 	page: 60,
	// },
	// {
	// 	year: '2002',
	// 	page: 66,
	// },
	// {
	// 	year: '2003',
	// 	page: 74,
	// },
	// {
	// 	year: '2004',
	// 	page: 82,
	// },
	// {
	// 	year: '2005',
	// 	page: 88,
	// },
	// {
	// 	year: '2006',
	// 	page: 108,
	// },
	// {
	// 	year: '2007',
	// 	page: 114,
	// },
	// {
	// 	year: '2008',
	// 	page: 125,
	// },
	// {
	// 	year: '2009',
	// 	page: 132,
	// },
	// {
	// 	year: '2010',
	// 	page: 142,
	// },
	// {
	// 	year: '2011',
	// 	page: 142,
	// },
	// {
	// 	year: '2012',
	// 	page: 148,
	// },
	// {
	// 	year: '2013',
	// 	page: 161,
	// },
	// {
	// 	year: '2014',
	// 	page: 167,
	// },
	// {
	// 	year: '2015',
	// 	page: 198,
	// },
	// {
	// 	year: '2016',
	// 	page: 228,
	// },
	// {
	// 	year: '2017',
	// 	page: 259,
	// },
	// {
	// 	year: '2018',
	// 	page: 380,
	// },
	// {
	// 	year: '2019',
	// 	page: 320,
	// },
	// {
	// 	year: '2020',
	// 	page: 367,
	// },
	// {
	// 	year: '2021',
	// 	page: 425,
	// },
	// {
	// 	year: '2022',
	// 	page: 146,
	// },
	// {
	// 	year: '1990',
	// 	page: 31,
	// },
	// {
	// 	year: '1989',
	// 	page: 30,
	// },
	// {
	// 	year: '2022',
	// 	page: 272,
	// },
	// {
	// 	year: '1987',
	// 	page: 27,
	// },
	// {
	// 	year: '1986',
	// 	page: 24,
	// },
	// {
	// 	year: '1985',
	// 	page: 26,
	// },
	// {
	// 	year: '1984',
	// 	page: 23,
	// },
	// {
	// 	year: '1983',
	// 	page: 22,
	// },
	// {
	// 	year: '1982',
	// 	page: 20,
	// },
	// {
	// 	year: '1981',
	// 	page: 21,
	// },
	{
		year: '2022',
		page: 283,
	}
	// {
	// 	year: '1980',
	// 	page: 19,
	// },
	// {
	// 	year: '1979',
	// 	page: 19,
	// },
	// {
	// 	year: '1978',
	// 	page: 19,
	// },
	// {
	// 	year: '1977',
	// 	page: 19,
	// },
	// {
	// 	year: '1976',
	// 	page: 19,
	// },
	// {
	// 	year: '1975',
	// 	page: 19,
	// },
	// {
	// 	year: '1974',
	// 	page: 19,
	// },
	// {
	// 	year: '1973',
	// 	page: 19,
	// },
	// {
	// 	year: '1972',
	// 	page: 19,
	// },
	// {
	// 	year: '1971',
	// 	page: 19,
	// },
	// {
	// 	year: '1970',
	// 	page: 19,
	// },
]

app.get(
	'/tv',
	asyncHandler(async (req, res, next) => {
		for (let j = 0; j < tvEndpoint.length; j++) {
			var endpoint = tvEndpoint[j]
			for (let i = 1; i <= endpoint.page; i++) {
				const { data } = await axios.get(
					`https://api.themoviedb.org/3/discover/tv?api_key=b6e66a75ceca7996c5772ddd0656dd1b&page=${i}&include_adult=true&first_air_date_year=${endpoint.year}`
				)

				for (let index = 0; index < data.results.length; index++) {
					const movie = data.results[index]
					await pool.query(
						`insert into tvshows 
						(id,
						 title,
                                     release,
						 rating,
						 poster,
						 language,
						 backdrop,
						 overview,
						 popularity,
						 genres)
                               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                               on conflict (id) do update set
					 title=$2,
					 release=$3,
					 rating=$4,
					 poster=$5,
					 language=$6,
					 backdrop=$7,
					 overview=$8,
					 popularity=$9,
					 genres=$10;`,
						[
							movie.id,
							movie.name,
							movie.first_air_date,
							movie.vote_average,
							movie.poster_path,
							movie.original_language,
							movie.backdrop_path,
							movie.overview,
							movie.popularity,
							movie.genre_ids,
						]
					)
				}
				console.log(
					`>>>> from ${endpoint.year} total ${endpoint.page} pages of ${i} scraped..`
				)
			}
			console.log(`\n//////${endpoint.year} completed//////\n\n\n\n`)
		}
		res.json('done')
	})
)

app.get(
	'/anime-tv',
	asyncHandler(async (req, res, next) => {

		for (let i = 1; i <= 134; i++) {
			const { data } = await axios.get(
				`https://api.themoviedb.org/3/discover/tv?api_key=b6e66a75ceca7996c5772ddd0656dd1b&include_adult=true&with_keywords=210024&page=${i}`
			)

			for (let index = 0; index < data.results.length; index++) {
				const movie = data.results[index]
				await pool.query(
					`insert into anime 
						(id,
						 title,
                                     release,
						 rating,
						 poster,
						 language,
						 backdrop,
						 overview,
						 popularity,
						 genres,
						 type
						 )
                               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                               on conflict (id) do update set
					 title=$2,
					 release=$3,
					 rating=$4,
					 poster=$5,
					 language=$6,
					 backdrop=$7,
					 overview=$8,
					 popularity=$9,
					 genres=$10,
					 type=$11;`,
					[
						movie.id,
						movie.name,
						movie.first_air_date,
						movie.vote_average,
						movie.poster_path,
						movie.original_language,
						movie.backdrop_path,
						movie.overview,
						movie.popularity,
						movie.genre_ids,
						'tv'
					]
				)
			}
			console.log(
				`>>>> from  pages of ${i} scraped..`
			)
		}
		console.log(`\n//////${endpoint.year} completed//////\n\n\n\n`)
		res.json('done')
	})
)




app.get(
	'/movies/search',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query
		let movies = []

		for (let i = 1; i <= 5; i++) {
			const { data } = await axios.get(
				`https://api.themoviedb.org/3/search/movie?api_key=b6e66a75ceca7996c5772ddd0656dd1b&page=${i}&query=${query}`
			)
			for (let index = 0; index < data.results.length; index++) {
				const movie = data.results[index]
				const { rows } = await pool.query(
					`insert into movies 
						(id,
						 title,
						 release,
						 rating,
						 poster,
						 language,
						 backdrop,
						 overview,
						 genres,
						 popularity,
						 adult)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             on conflict (id) do update set 
					 title=$2,
					 release=$3,
					 rating=$4,
					 poster=$5,
					 language=$6,
					 backdrop=$7,
					 overview=$8,
					 genres=$9,
					 popularity=$10,
					 adult=$11 returning *;`,
					[
						movie.id,
						movie.title,
						(movie.release_date == null) ? movie.release_date :
							(movie.release_date.length === 0) ? null : movie.release_date,
						movie.vote_average,
						movie.poster_path,
						movie.original_language,
						movie.backdrop_path,
						movie.overview,
						movie.genre_ids,
						movie.popularity,
						movie.adult,
					]
				)
				movies.push(rows[0])
			}
		}
		res.json({
			length: movies.length,
			results: movies
		})
	})
)


app.get(
	'/tv/search',
	asyncHandler(async (req, res, next) => {
		const { query } = req.query
		let movies = []

		for (let i = 1; i <= 5; i++) {
			const { data } = await axios.get(
				`https://api.themoviedb.org/3/search/tv?api_key=b6e66a75ceca7996c5772ddd0656dd1b&page=${i}&query=${query}`
			)
			for (let index = 0; index < data.results.length; index++) {
				const movie = data.results[index]
				const { rows } = await pool.query(
					`insert into tvshows 
						(id,
						 title,
                                     release,
						 rating,
						 poster,
						 language,
						 backdrop,
						 overview,
						 popularity,
						 genres)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           on conflict (id) do update set
					 title=$2,
					 release=$3,
					 rating=$4,
					 poster=$5,
					 language=$6,
					 backdrop=$7,
					 overview=$8,
					 popularity=$9,
					 genres=$10 returning *;`,
					[
						movie.id,
						movie.name,
						movie.first_air_date,
						movie.vote_average,
						movie.poster_path,
						movie.original_language,
						movie.backdrop_path,
						movie.overview,
						movie.popularity,
						movie.genre_ids,
					]
				)
				movies.push(rows[0])
			}
		}

		res.json({
			length: movies.length,
			results: movies
		})
	})
)

export default app
