const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const { ensureDirs, readJson, writeJson } = require('./utils/storage');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

ensureDirs();

const usersFile = path.join(__dirname, 'data', 'users.json');
const users = readJson(usersFile, []);
if (users.length === 0) {
  const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!', 10);
  users.push({
    id: 'admin-1',
    name: process.env.ADMIN_NAME || 'Ayesha Zahid',
    email: (process.env.ADMIN_EMAIL || 'ayesha@example.com').toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  });
  writeJson(usersFile, users);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.appTitle = process.env.APP_TITLE || 'Ayesha Zahid Personal Dashboard';
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

app.use(authRoutes);
app.use(dashboardRoutes);

app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', {
    pageTitle: 'Server Error',
    details: isProduction ? null : err.message
  });
});

app.listen(PORT, () => {
  console.log(`${process.env.APP_TITLE || 'App'} running on port ${PORT}`);
});
