function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please sign in first.');
    return res.redirect('/login');
  }
  return next();
}

module.exports = { requireAuth };
