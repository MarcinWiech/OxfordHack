// Dependencies
const express = require('express')
const expressSession = require('express-session')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const authService = require('./src/services/authenticate')
const rp = require('request-promise')
const path = require('path')
const spawn = require('threads').spawn

// Services
const { facebookStrategy } = require('./src/services/passportStrategy')
const { getPrediction } = require('./src/services/prediction')
const { getTranslations } = require('./src/services/translation')
const { categoriseMessage } = require('./src/services/analytics')
const Database = require('./src/services/database')
const db = Database.getInstance()

// App setup
const PORT = process.env.PORT || 3000
const app = express()
app.use(expressSession({ secret: 'secret', resave: true, saveUninitialized: true }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  next()
})

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
  passport.authenticate('facebook', {
    successRedirect: '/api/authorise/success',
    failureRedirect: '/api/authorise/failure'
  }))

app.get('/api/authorise/success', authService.isLoggedIn, (req, res) => res.send(`${req.user.firstName} is authorised.`))
app.get('/api/authorise/failure', (req, res, next) => res.send('You have not authorised Facebook.'))

app.get('/api/posts', async (req, res, next) => {
  const users = await db.getUsers()
  if (users.length == 0) return res.send('No data.')

  const requests = users.map(({ accessToken }) => {
    return rp({
      method: 'GET',
      uri: `https://graph.facebook.com/me/posts`,
      qs: {
        'access_token': accessToken,
        'fields': 'message,created_time,place,message_tags,story_tags,with_tags,story,picture,id'
      }
    })
  })

  const results = []
  for (let req of requests) results.push(await req)
  const parsedResults = results.map(result => JSON.parse(result).data)
    .filter(result => result.length != 0)
    .reduce((prev, curr) => prev.concat(curr), [])
    .filter(entry => 'message' in entry)

  console.log(JSON.stringify(parsedResults))

  const messages = parsedResults.map(entry => entry.message)

  // Translations
  const translatedMessages = await getTranslations(messages)

  // Prediction  
  const result = await getPrediction(translatedMessages.map(translation => translation.text))
  const returnObj = []

  for (let i = 0; i < result.length; ++i) {
    const entry = result[i]
    const fbRes = parsedResults[i]
    const ogMessage = messages[i]
    const { language } = translatedMessages[i]

    const categories = await categoriseMessage(entry.message)
    entry['categories'] = categories.data

    if ('picture' in fbRes) entry.picture = fbRes.picture
    if ('place' in fbRes) entry.place = fbRes.place
    entry['created_time'] = fbRes['created_time']
    entry['language'] = language
    entry['profile'] = `https://www.facebook.com/profile.php?id=${fbRes.id.split('_')[0]}`

    if (language != 'en') {
      entry['original_message'] = ogMessage
    }

    returnObj.push(entry)
  }

  return res.json(returnObj)
})

app.get('/reset', (req, res, next) => {
  db.delete(null).then(result => res.send('OK')).catch(error => next(error))
})

// Static routes
app.get('/', (req, res) => res.redirect('/index'))
app.use('/index', express.static(path.join(__dirname, '/public/index.html')))
app.use('/assets', express.static(path.join(__dirname, '/public/assets')))

const { getTweet } = require('./src/services/twitter')
app.get('/twitter', async (req, res, next) => {
  const result = await getTweet()
  console.log(result)
  res.send('OK')
})

app.use('*', (req, res, next) => next(new Error('Cannot get path.')))

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).send(`Error: ${err.message}`)
})

const fbThread = spawn(async (db) => {
  console.log(db)
  const users = await db.getUsers()
  if (users.length == 0) return []

  const requests = users.map(({ accessToken }) => {
    return rp({
      method: 'GET',
      uri: `https://graph.facebook.com/me/posts`,
      qs: {
        'access_token': accessToken,
        'fields': 'message,created_time,place,message_tags,story_tags,with_tags,story,picture,id'
      }
    })
  })

  const results = []
  for (let req of requests) results.push(await req)

  return results
})

const REFRESH_RATE = 2000

// let totalPosts = 0

// function infinitePoll() {
//   const promise = new Promise((resolve, reject) => {
//     db.getUsers().then(users => {
//       if (users.length == 0) return resolve([])
//       const requests = users.map(({ accessToken }) => {
//         return rp({
//           method: 'GET',
//           uri: `https://graph.facebook.com/me/posts`,
//           qs: {
//             'access_token': accessToken,
//             'fields': 'message,created_time,place,message_tags,story_tags,with_tags,story,picture,id'
//           }
//         })
//       })
  
//       Promise.all(requests)
//         .then(results => {
//           const { data } = JSON.parse(results)
//           resolve(data)
//         })
//         .catch(errors => reject(errors))
//     }).catch(error => reject(error))
//   })

//   promise.then(res => {
//     console.log(res.length)
//     if (res.length != totalPosts) {
//       totalPosts = res.length
//       console.log('New data!')
//     }

//     setTimeout(() => infinitePoll(), REFRESH_RATE)
//   }).catch(error => {
//     console.error(error)
//     setTimeout(() => infinitePoll(), REFRESH_RATE)
//   })
// }

// infinitePoll()

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))