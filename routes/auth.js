const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { readJson } = require('../utils/storage');

const router = express.Router();
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.render('login', { pageTitle: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJson(usersFile, []);
  const user = users.find((entry) => entry.email === String(email || '').toLowerCase().trim());

  if (!user) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }

  const isValid = await bcrypt.compare(String(password || ''), user.passwordHash);
  if (!isValid) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email
  };
  req.flash('success', `Welcome back, ${user.name}.`);
  return res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
