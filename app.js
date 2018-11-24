// Dependencies
const express = require('express')
const expressSession = require('express-session')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const authService = require('./src/services/authenticate')
const rp = require('request-promise')
const path = require('path')
const mysql = require('mysql')

// Services
const { facebookStrategy } = require('./src/services/passportStrategy')
const { getPrediction } =  require('./src/services/prediction')
const Database = require('./src/services/database')
const db = Database.getInstance()

// Database setup
// const connection = mysql.createConnection({

// })

// App setup
const PORT = process.env.PORT || 3000
const app = express()
app.use(expressSession({ secret: 'secret', resave: true, saveUninitialized: true }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

// Passport setup
passport.serializeUser((user, done) => done(null, JSON.stringify(user)))
passport.deserializeUser((obj, done) => done(null, JSON.parse(obj)))

passport.use(facebookStrategy)

// Routes
app.get('/_health', (req, res) => res.send('OK'))

app.get('/api/authorise', (req, res) => res.redirect('/api/auth/facebook'))

app.get('/api/auth/facebook', 
        passport.authenticate('facebook', { scope: ['user_posts'] }))

app.get('/api/auth/facebook/callback', 
        passport.authenticate('facebook', { successRedirect: '/api/authorise/success',    
                                            failureRedirect: '/api/authorise/failure' }))

app.get('/api/authorise/success', authService.isLoggedIn, (req, res) => res.send(`${req.user.firstName} is authorised.`))
app.get('/api/authorise/failure', (req, res, next) => res.send('You have not authorised Facebook.'))

app.get('/api/posts', (req, res, next) => {
  const requests = db.users.map( ({ accessToken }) => {
    return rp({
      method: 'GET',
      uri: `https://graph.facebook.com/me/posts`,
      qs: {
        'access_token': accessToken,
        'fields': 'message,created_time,place,message_tags,story_tags,with_tags,story,picture'
      }
    })
  })

  Promise.all(requests)
    .then(results => {
      const parsedResults = results.map(result => JSON.parse(result).data)
                                    .filter(result => result.length != 0)
                                    .reduce((prev, curr) => prev.concat(curr), [])
                                    .filter(entry => 'message' in entry)

      let messages = parsedResults.map(entry => entry.message)

      getPrediction(messages)
        .then(result => res.json(result))
        .catch(error => next(new Error(error)))
    })
    .catch(error => next(new Error(error)))
})

// Static routes
app.get('/', (req, res) => res.redirect('/index'))
app.use('/index', express.static(path.join(__dirname, '/public/index.html')))
app.use('/assets', express.static(path.join(__dirname, '/public/assets')))
app.use('*', (req, res, next) => next(new Error('Cannot get path.')))

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).send(`Error: ${err.message}`)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))