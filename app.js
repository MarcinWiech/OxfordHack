const ENABLE_REFRESH = false

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
const { getTweets } = require('./src/services/twitter')
const Database = require('./src/services/database')
const db = Database.getInstance()

// App setup
const PORT = process.env.PORT || 3000
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

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

// WebSockets
const activeSockets = new Set()
io.on('connection', client => {
  client.join('all')
  console.log('Connect!')
  client.on('disconnect', () => console.log('Disconnect.'))
})


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
  const fbData = await getFBPosts()
  fbData.forEach(data => data.source = 'facebook')

  const tweets = await getTweets()
  tweets.forEach(data => data.source = 'twitter')
  console.log(tweets)

  return res.json(fbData.concat(tweets))
})

async function getFBPosts() {
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
  const parsedResults = results.map(result => JSON.parse(result).data)
    .filter(result => result.length != 0)
    .reduce((prev, curr) => prev.concat(curr), [])
    .filter(entry => 'message' in entry)

  // console.log(JSON.stringify(parsedResults))

  const returnObj = await processFBData(parsedResults)
  return returnObj
}

async function processFBData(parsedResults) {
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
    entry['postID'] = fbRes.id

    if (language != 'en') {
      entry['original_message'] = ogMessage
    }

    returnObj.push(entry)
  }

  return returnObj
}

app.get('/reset', (req, res, next) => {
  db.delete(null).then(result => res.send('OK')).catch(error => next(error))
})

// Static routes
app.get('/', (req, res) => res.redirect('/index'))
app.use('/index', express.static(path.join(__dirname, '/public/index.html')))
app.use('/assets', express.static(path.join(__dirname, '/public/assets')))
app.use('/assets/public/index.html', (req, res) => res.redirect('/'))


app.get('/twitter', async (req, res, next) => {
  const result = await getTweets()
  console.log(result)
  res.send('OK')
})

app.use('*', (req, res, next) => next(new Error('Cannot get path.')))

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).send(`Error: ${err.message}`)
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`))

if (ENABLE_REFRESH) {
  const REFRESH_RATE = 2000

  let init = true
  let postIds = new Set()

  function infinitePoll() {
    const promise = new Promise((resolve, reject) => {
      db.getUsers().then(users => {
        if (users.length == 0) return resolve([])
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

        Promise.all(requests)
          .then(results => {
            const { data } = JSON.parse(results)

            const parsedResults = data.filter(result => result.length != 0)
              .reduce((prev, curr) => prev.concat(curr), [])
              .filter(entry => 'message' in entry)

            processFBData(parsedResults).then(data => resolve(data)).catch(errors => reject(errors))
          })
          .catch(errors => reject(errors))
      }).catch(error => reject(error))
    })

    promise.then(res => {
      console.log('Refreshed!')
      const additions = []
      for (let data of res) {
        const { postID } = data
        if (!postIds.has(postID)) {
          postIds.add(postID)
          additions.push(data)
        }
      }

      if (additions.length != 0 && !init) {
        console.log('Emitting!')
        io.emit('all', JSON.stringify(additions))
      }

      init = false

      setTimeout(() => infinitePoll(), REFRESH_RATE)
    }).catch(error => {
      console.error(error)
      setTimeout(() => infinitePoll(), REFRESH_RATE)
    })
  }

  infinitePoll()
}
