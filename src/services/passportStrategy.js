const Strategy = require('passport-facebook').Strategy

const Database = require('./database')

const db = Database.getInstance()

const facebookStrategy = new Strategy({
  clientID: '1396108933853105',
  clientSecret: '77dcccaddbd648ad2266d21e7ed641ce',
  callbackURL: 'http://localhost:3000/api/auth/facebook/callback'
}, (accessToken, refreshToken, profile, done) => {
  // console.log(accessToken)
  const user = {}
  user.id = Number(profile.id)
  user.accessToken = accessToken
  user.refreshToken = refreshToken
  user.firstName = profile.displayName
  user.lastName = profile.name.lastName

  db.add(user)
    .then(_ => done(null, user))
    .catch(err => done(err, null))
  // done(null, user)
})

module.exports = {
  facebookStrategy: facebookStrategy
}