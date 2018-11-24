// Dependencies
const express = require('express')
const passport = require('passport')

// Services
const { facebookStrategy } = require('./services/passportStrategy')


// App setup
const PORT = process.env.PORT || 3000
const app = express()
app.use(passport.initialize())
app.use(passport.session())

// Passport setup
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use('facebook', facebookStrategy)



// Routes
app.get('/_health', (req, res) => res.send('OK'))


app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))