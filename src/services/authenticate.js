function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/api/authorise')
}

module.exports = {
  isLoggedIn: isLoggedIn
}