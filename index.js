//
// imports
import dotenv from 'dotenv'
import express from 'express'
import errorHandler from './middlewares/error-handler.js'
import favoriteRoute from './routes/favorites/favorite.js'
import genreRoute from './routes/genre/genre.js'
import mediaRoute from './routes/media/upload-media.js'
import moviesRoute from './routes/movies/movies.js'
import notificationRoute from './routes/notifications/notifications.js'
import personRoute from './routes/person/person.js'
import reportRoute from './routes/report/report_review.js'
import reviewRoute from './routes/reviews/reviews.js'
import searchRoute from './routes/search/search.js'
import trendingRoute from './routes/trending/trending.js'
import tvRoute from './routes/tv/tv.js'
import userRoute from './routes/user/user.js'
import scaper from './scraper.js'
//
// configure environment variables
dotenv.config({ path: '.env' })

//
// initailize express app
const app = express()
const PORT = process.env.PORT || 4444

// set up express app to handle data parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// initialize routes
app.get('/', (req, res) => res.json('welcome to the cineaste api'))
app.use('/api/v1/user', userRoute)
app.use('/api/v1/movies', moviesRoute)
app.use('/api/v1/tv', tvRoute)
app.use('/api/v1/search', searchRoute)
app.use('/api/v1/reviews', reviewRoute)
app.use('/api/v1/media', mediaRoute)
app.use('/api/v1/person', personRoute)
app.use('/api/v1/trending', trendingRoute)
app.use('/api/v1/report', reportRoute)
app.use('/api/v1/favorite', favoriteRoute)
app.use('/api/v1/genres', genreRoute)
app.use('/api/v1/notifications', notificationRoute)
app.use('/scraper', scaper)

//
app.use(errorHandler)

// set up express app to listen for requests
app.listen(PORT, () => console.log('listening on port 4444'))
// ae6be8cc9093dcfbed5e44b99a43d1a1
// ansH00@r
